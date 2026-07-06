import { useCallback, useEffect, useRef, useState } from 'react';
import {
  checkExportStatusApi,
  checkSceneVideoStatusApi,
  generateCharacterApi,
  generateScenesApi,
  generateStoryApi,
  getLastFrameApi,
  listProjectsApi,
  loadProjectApi,
  regenerateOneSceneApi,
  saveProjectApi,
  startExportApi,
  startSceneVideoApi,
} from '../api';
import {
  blankDraft,
  EXPRESSION_PRESETS,
  FLOW_SCREENS,
  type Character,
  type CharacterDraft,
  type EpisodeConfig,
  type ExportJobStatus,
  type FinalConfig,
  type PersistedProject,
  type Project,
  type Scene,
  type SceneVideoState,
  type Screen,
  type Story,
} from '../types';

function defaultEpisodeConfig(): EpisodeConfig {
  return {
    theme: 'Friendship',
    duration: '1 minute',
    audience: 'Preschool (3-5)',
    mood: 'Wholesome',
    visualStyle: 'Storybook 2D (Peppa Pig style)',
    language: 'English',
    numScenes: 5,
    idea: '',
  };
}

function defaultFinalConfig(): FinalConfig {
  return { captionsOn: true, music: 'Warm acoustic (default)', format: 'YouTube Shorts' };
}

const THUMB_GRADIENTS = [
  'linear-gradient(135deg,#3B2E6B,#6B3E7A)',
  'linear-gradient(135deg,#2E4B6B,#3E6B85)',
  'linear-gradient(135deg,#6B2E3E,#8A3E4F)',
  'linear-gradient(135deg,#3E6B4F,#4F8A6B)',
  'linear-gradient(135deg,#2A283C,#3A3750)',
];

function statusLabelForProject(p: PersistedProject): string {
  const allApproved = p.scenes.length > 0 && p.scenes.every((s) => p.videos[s.id]?.status === 'approved');
  if (allApproved) return 'Video Ready';
  if (p.scenes.some((s) => p.videos[s.id])) return 'Videos in Progress';
  if (p.story?.approved) return 'Story Approved';
  return 'Draft';
}

function progressPctForProject(p: PersistedProject): string {
  const idx = FLOW_SCREENS.indexOf(p.screen);
  const pct = idx <= 0 ? 10 : Math.round(((idx + 1) / FLOW_SCREENS.length) * 100);
  return `${Math.min(100, Math.max(10, pct))}%`;
}

// Dashboard/ProjectDetail only need a lightweight summary — derive it from whatever
// full project state each past project last saved, rather than storing it separately.
function summarizeProject(p: PersistedProject, index: number): Project {
  const title = p.story?.title || (p.characters[0] ? `${p.characters[0].name}'s Show` : 'Untitled Draft');
  const initials =
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'UD';
  const metaParts = [
    `${p.characters.length} character${p.characters.length === 1 ? '' : 's'}`,
    p.episodeConfig?.theme,
    p.episodeConfig?.duration,
  ].filter(Boolean);
  return {
    id: p.id,
    title,
    meta: metaParts.join(' · '),
    initials,
    statusLabel: statusLabelForProject(p),
    progressPct: progressPctForProject(p),
    thumbGradient: THUMB_GRADIENTS[index % THUMB_GRADIENTS.length],
  };
}

function durationSecondsForScene(episodeConfig: EpisodeConfig): number {
  const totalSeconds =
    { '30 seconds': 30, '1 minute': 60, '2 minutes': 120, '3 minutes': 180, '5 minutes': 300 }[episodeConfig.duration] ?? 60;
  const perScene = totalSeconds / Math.max(1, episodeConfig.numScenes);
  return Math.max(4, Math.min(8, Math.round(perScene)));
}

// Scene 1 has no prior clip to continue from, so it starts from a character portrait
// instead — pick whichever finalized character is actually named in that scene.
function pickPrimaryCharacterImage(
  scene: { charactersInvolved: string },
  characters: Character[]
): { imageBase64: string; mimeType: string } | undefined {
  const names = scene.charactersInvolved.split(',').map((n) => n.trim().toLowerCase());
  const chosen = characters.find((c) => names.includes(c.name.toLowerCase())) || characters[0];
  return chosen ? { imageBase64: chosen.imageBase64, mimeType: chosen.mimeType } : undefined;
}

export function useAppState() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Every episode is its own project, with its own id and its own cast — starting a
  // new episode gets a fresh id and wipes all in-progress state below so nothing
  // bleeds over from whatever project was open before.
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
  const [projectRecords, setProjectRecords] = useState<PersistedProject[]>([]);
  const projects = projectRecords.map(summarizeProject);

  const refreshProjects = useCallback(() => {
    listProjectsApi().then(setProjectRecords);
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const [charTab, setCharTab] = useState<'create' | 'gallery'>('create');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [draft, setDraft] = useState<CharacterDraft>(blankDraft());
  const [charGenStatus, setCharGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [charGenError, setCharGenError] = useState<string | null>(null);
  const [charGenResult, setCharGenResult] = useState<{ bio: string; imageBase64: string; mimeType: string } | null>(null);

  const [episodeConfig, setEpisodeConfig] = useState<EpisodeConfig>(defaultEpisodeConfig());

  const [story, setStory] = useState<Story | null>(null);
  const [storyGenStatus, setStoryGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [storyGenError, setStoryGenError] = useState<string | null>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scenesGenStatus, setScenesGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [scenesGenError, setScenesGenError] = useState<string | null>(null);
  const [regeneratingSceneIds, setRegeneratingSceneIds] = useState<Record<string, boolean>>({});
  const [editingMotionPromptId, setEditingMotionPromptId] = useState<string | null>(null);

  const [videos, setVideos] = useState<Record<string, SceneVideoState>>({});
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);

  const [finalConfig, setFinalConfig] = useState<FinalConfig>(defaultFinalConfig());
  const [exportTransition, setExportTransition] = useState('fade');
  const [exportStatus, setExportStatus] = useState<ExportJobStatus>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);

  const goLanding = useCallback(() => setScreen('landing'), []);
  const goLogin = useCallback(() => setScreen('login'), []);
  const goDashboard = useCallback(() => setScreen('dashboard'), []);

  // A brand-new episode is a brand-new project: fresh id, empty cast, defaults reset —
  // so it never inherits characters or progress from whatever project was open before.
  const startNewEpisode = useCallback(() => {
    setProjectId(crypto.randomUUID());
    setCharacters([]);
    setDraft(blankDraft());
    setCharGenResult(null);
    setCharGenStatus('idle');
    setCharGenError(null);
    setCharTab('create');
    setEpisodeConfig(defaultEpisodeConfig());
    setStory(null);
    setStoryGenStatus('idle');
    setStoryGenError(null);
    setIsEditingStory(false);
    setScenes([]);
    setScenesGenStatus('idle');
    setScenesGenError(null);
    setVideos({});
    setFinalConfig(defaultFinalConfig());
    setExportTransition('fade');
    setExportStatus('idle');
    setExportError(null);
    setExportId(null);
    setScreen('characters');
  }, []);

  const openProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    setScreen('projectDetail');
  }, []);

  const resumeProjectById = useCallback(async (id: string) => {
    const record = await loadProjectApi(id);
    if (!record) return;
    setProjectId(id);
    setCharacters(record.characters);
    setEpisodeConfig(record.episodeConfig);
    setStory(record.story);
    setStoryGenStatus(record.story ? 'ready' : 'idle');
    setScenes(record.scenes);
    setScenesGenStatus(record.scenes.length > 0 ? 'ready' : 'idle');
    setVideos(record.videos);
    setFinalConfig(record.finalConfig);
    setScreen(record.screen);
  }, []);

  const setDraftField = useCallback(
    (field: keyof CharacterDraft) => (value: string) => setDraft((d) => ({ ...d, [field]: value })),
    []
  );
  const setDraftRole = useCallback((role: string) => setDraft((d) => ({ ...d, role })), []);

  const generateCharacter = useCallback(async () => {
    setCharGenStatus('generating');
    setCharGenError(null);
    setCharGenResult(null);
    try {
      const result = await generateCharacterApi(draft);
      setCharGenResult({ bio: result.bio, imageBase64: result.imageBase64, mimeType: result.mimeType });
      setCharGenStatus('ready');
    } catch (err) {
      setCharGenError(err instanceof Error ? err.message : 'Character generation failed.');
      setCharGenStatus('error');
    }
  }, [draft]);

  const saveCharacter = useCallback(() => {
    if (!charGenResult || !draft.name.trim()) return;
    const newChar: Character = {
      ...draft,
      id: 'c' + Date.now(),
      bio: charGenResult.bio,
      imageBase64: charGenResult.imageBase64,
      mimeType: charGenResult.mimeType,
    };
    setCharacters((prev) => [...prev, newChar]);
    setDraft(blankDraft());
    setCharGenResult(null);
    setCharGenStatus('idle');
    setCharTab('gallery');
  }, [charGenResult, draft]);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const generateExpressionVideo = useCallback(
    (characterId: string, expressionKey: string) => {
      const character = characters.find((c) => c.id === characterId);
      const preset = EXPRESSION_PRESETS.find((p) => p.key === expressionKey);
      if (!character || !preset) return;
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === characterId
            ? { ...c, expressionVideos: { ...c.expressionVideos, [expressionKey]: { status: 'generating' } } }
            : c
        )
      );
      const prompt =
        `${character.name} ${preset.action}. Keep the exact same character design, art style, outfit, and colors ` +
        'as the reference image. Gentle, wholesome kids’ show animation — simple shapes, bright flat colors, no scary or violent content.';
      startSceneVideoApi(`${characterId}::${expressionKey}`, character.imageBase64, character.mimeType, prompt, 4)
        .then(({ operationName }) => {
          setCharacters((prev) =>
            prev.map((c) =>
              c.id === characterId
                ? { ...c, expressionVideos: { ...c.expressionVideos, [expressionKey]: { status: 'generating', operationName } } }
                : c
            )
          );
        })
        .catch((err) => {
          setCharacters((prev) =>
            prev.map((c) =>
              c.id === characterId
                ? {
                    ...c,
                    expressionVideos: {
                      ...c.expressionVideos,
                      [expressionKey]: { status: 'error', error: err instanceof Error ? err.message : 'Expression video generation failed.' },
                    },
                  }
                : c
            )
          );
        });
    },
    [characters]
  );

  const charactersRef = useRef(characters);
  charactersRef.current = characters;
  useEffect(() => {
    const interval = setInterval(() => {
      charactersRef.current.forEach((c) => {
        Object.entries(c.expressionVideos || {}).forEach(([key, v]) => {
          if (v.status !== 'generating' || !v.operationName || v.videoId) return;
          checkSceneVideoStatusApi(v.operationName)
            .then((status) => {
              if (!status.done) return;
              setCharacters((prev) =>
                prev.map((ch) =>
                  ch.id === c.id
                    ? {
                        ...ch,
                        expressionVideos: {
                          ...ch.expressionVideos,
                          [key]: status.error
                            ? { status: 'error', error: status.error }
                            : { status: 'ready', videoId: status.videoId },
                        },
                      }
                    : ch
                )
              );
            })
            .catch((err) => {
              setCharacters((prev) =>
                prev.map((ch) =>
                  ch.id === c.id
                    ? {
                        ...ch,
                        expressionVideos: {
                          ...ch.expressionVideos,
                          [key]: { status: 'error', error: err instanceof Error ? err.message : 'Checking expression video failed.' },
                        },
                      }
                    : ch
                )
              );
            });
        });
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const continueToEpisodeSetup = useCallback(() => setScreen('episodeSetup'), []);

  const setEpisodeField = useCallback(
    <K extends keyof EpisodeConfig>(field: K) => (value: EpisodeConfig[K]) =>
      setEpisodeConfig((c) => ({ ...c, [field]: value })),
    []
  );

  const runGenerateStory = useCallback(async () => {
    setStoryGenStatus('generating');
    setStoryGenError(null);
    try {
      const result = await generateStoryApi(characters, episodeConfig);
      setStory({ ...result, approved: false });
      setStoryGenStatus('ready');
    } catch (err) {
      setStoryGenError(err instanceof Error ? err.message : 'Story generation failed.');
      setStoryGenStatus('error');
    }
  }, [characters, episodeConfig]);

  const generateStoryAction = useCallback(() => {
    setScreen('story');
    void runGenerateStory();
  }, [runGenerateStory]);

  const regenerateStory = useCallback(() => {
    void runGenerateStory();
  }, [runGenerateStory]);

  const setStoryFull = useCallback((value: string) => setStory((s) => (s ? { ...s, full: value } : s)), []);
  const toggleEditStory = useCallback(() => setIsEditingStory((v) => !v), []);

  const runGenerateScenes = useCallback(async () => {
    if (!story) return;
    setScenesGenStatus('generating');
    setScenesGenError(null);
    try {
      const result = await generateScenesApi(story, episodeConfig, characters);
      const withIds: Scene[] = result.scenes.map((s, i) => ({
        ...s,
        id: 'sc' + (i + 1),
        number: s.number || i + 1,
        approved: false,
      }));
      setScenes(withIds);
      setScenesGenStatus('ready');
    } catch (err) {
      setScenesGenError(err instanceof Error ? err.message : 'Scene breakdown failed.');
      setScenesGenStatus('error');
    }
  }, [story, episodeConfig, characters]);

  const approveStory = useCallback(() => {
    setStory((s) => (s ? { ...s, approved: true } : s));
    setIsEditingStory(false);
    setScreen('scenes');
    void runGenerateScenes();
  }, [runGenerateScenes]);

  const approveScene = useCallback((id: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, approved: true } : s)));
  }, []);

  const regenerateScene = useCallback(
    async (id: string) => {
      if (!story) return;
      const target = scenes.find((s) => s.id === id);
      if (!target) return;
      setRegeneratingSceneIds((prev) => ({ ...prev, [id]: true }));
      try {
        const { scene: fresh } = await regenerateOneSceneApi(story, episodeConfig, characters, target);
        setScenes((prev) => prev.map((s) => (s.id === id ? { ...fresh, id, number: s.number, approved: false } : s)));
      } catch (err) {
        setScenesGenError(err instanceof Error ? err.message : 'Regenerating that scene failed.');
      } finally {
        setRegeneratingSceneIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [story, episodeConfig, characters, scenes]
  );

  const updateSceneMotionPrompt = useCallback((id: string, videoPrompt: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, videoPrompt } : s)));
  }, []);

  // Scenes generate one at a time, in order: each scene's video continues from the
  // previous scene's actual last frame (extracted server-side), so the episode reads
  // as one continuous shot instead of jump-cutting between unrelated stills. Scene 1
  // has nothing to continue from, so it starts from a character portrait instead.
  const startVideoForScene = useCallback(
    async (scene: Scene, sceneIndex: number) => {
      setVideos((prev) => ({ ...prev, [scene.id]: { status: 'generating' } }));
      try {
        let ref: { imageBase64: string; mimeType: string } | undefined;
        if (sceneIndex === 0) {
          ref = pickPrimaryCharacterImage(scene, characters);
          if (!ref) throw new Error('Add at least one character before generating scene videos.');
        } else {
          const prevScene = scenes[sceneIndex - 1];
          const prevVideoId = videos[prevScene?.id ?? '']?.videoId;
          if (!prevVideoId) throw new Error('The previous scene needs to be approved first.');
          ref = await getLastFrameApi(prevVideoId);
        }
        const { operationName } = await startSceneVideoApi(
          scene.id,
          ref.imageBase64,
          ref.mimeType,
          scene.videoPrompt,
          durationSecondsForScene(episodeConfig)
        );
        setVideos((prev) => ({ ...prev, [scene.id]: { status: 'generating', operationName } }));
      } catch (err) {
        setVideos((prev) => ({
          ...prev,
          [scene.id]: { status: 'error', error: err instanceof Error ? err.message : 'Video generation failed.' },
        }));
      }
    },
    [characters, scenes, videos, episodeConfig]
  );

  const goToVideos = useCallback(() => {
    setScreen('videos');
    if (scenes.length > 0) void startVideoForScene(scenes[0], 0);
  }, [scenes, startVideoForScene]);

  const approveVideo = useCallback(
    (sceneId: string) => {
      setVideos((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], status: 'approved' } }));
      const index = scenes.findIndex((s) => s.id === sceneId);
      const next = scenes[index + 1];
      if (next && !videos[next.id]) {
        void startVideoForScene(next, index + 1);
      }
    },
    [scenes, videos, startVideoForScene]
  );
  const regenerateVideo = useCallback(
    (sceneId: string) => {
      const index = scenes.findIndex((s) => s.id === sceneId);
      if (index === -1) return;
      void startVideoForScene(scenes[index], index);
    },
    [scenes, startVideoForScene]
  );

  const videosRef = useRef(videos);
  videosRef.current = videos;
  useEffect(() => {
    const interval = setInterval(() => {
      Object.entries(videosRef.current).forEach(([sceneId, v]) => {
        if (v.status === 'generating' && v.operationName && !v.videoId) {
          checkSceneVideoStatusApi(v.operationName)
            .then((status) => {
              if (!status.done) return;
              if (status.error) {
                setVideos((prev) => ({ ...prev, [sceneId]: { status: 'error', error: status.error } }));
              } else if (status.videoId) {
                setVideos((prev) => ({ ...prev, [sceneId]: { status: 'ready', videoId: status.videoId } }));
              }
            })
            .catch((err) => {
              setVideos((prev) => ({
                ...prev,
                [sceneId]: { status: 'error', error: err instanceof Error ? err.message : 'Checking video status failed.' },
              }));
            });
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const goToFinal = useCallback(() => setScreen('final'), []);
  const toggleCaptions = useCallback(() => setFinalConfig((c) => ({ ...c, captionsOn: !c.captionsOn })), []);
  const setMusic = useCallback((music: string) => setFinalConfig((c) => ({ ...c, music })), []);
  const setExportFormat = useCallback((format: string) => setFinalConfig((c) => ({ ...c, format })), []);

  const startExport = useCallback(async () => {
    const approvedClips = scenes
      .filter((s) => videos[s.id]?.status === 'approved' && videos[s.id]?.videoId)
      .map((s) => ({ videoId: videos[s.id].videoId as string }));
    if (approvedClips.length === 0) return;
    setExportStatus('processing');
    setExportError(null);
    setExportId(null);
    try {
      const { exportId: newExportId } = await startExportApi(approvedClips, exportTransition, finalConfig.format);
      setExportId(newExportId);
    } catch (err) {
      setExportStatus('error');
      setExportError(err instanceof Error ? err.message : 'Export failed to start.');
    }
  }, [scenes, videos, exportTransition, finalConfig.format]);

  useEffect(() => {
    if (exportStatus !== 'processing' || !exportId) return;
    const interval = setInterval(() => {
      checkExportStatusApi(exportId)
        .then((res) => {
          if (res.status === 'ready') setExportStatus('ready');
          else if (res.status === 'error') {
            setExportStatus('error');
            setExportError(res.error || 'Export failed.');
          }
        })
        .catch((err) => {
          setExportStatus('error');
          setExportError(err instanceof Error ? err.message : 'Checking export status failed.');
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [exportStatus, exportId]);

  const jumpToStep = useCallback((target: Screen) => {
    const currentIdx = FLOW_SCREENS.indexOf(screen);
    const targetIdx = FLOW_SCREENS.indexOf(target);
    if (targetIdx <= currentIdx) setScreen(target);
  }, [screen]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Autosave: debounced so we're not writing on every keystroke, and skipped until
  // there's actually a project worth saving (a character or scene exists). Each
  // project saves under its own id, so switching projects never overwrites another.
  const hasSaveableContent = characters.length > 0 || scenes.length > 0;
  useEffect(() => {
    if (!hasSaveableContent) return;
    setSaveStatus('saving');
    const timeout = setTimeout(() => {
      saveProjectApi({ id: projectId, screen, characters, episodeConfig, story, scenes, videos, finalConfig })
        .then(() => {
          setSaveStatus('saved');
          refreshProjects();
        })
        .catch(() => setSaveStatus('idle'));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [hasSaveableContent, projectId, screen, characters, episodeConfig, story, scenes, videos, finalConfig, refreshProjects]);

  return {
    screen, setScreen, jumpToStep,
    authTab, setAuthTab,
    selectedProjectId, projects,
    goLanding, goLogin, goDashboard, startNewEpisode, openProject, resumeProjectById,

    charTab, setCharTab, characters, draft, setDraftField, setDraftRole,
    charGenStatus, charGenError, charGenResult, generateCharacter, saveCharacter, deleteCharacter,
    generateExpressionVideo,
    continueToEpisodeSetup,

    episodeConfig, setEpisodeField,
    story, storyGenStatus, storyGenError, isEditingStory,
    generateStoryAction, regenerateStory, setStoryFull, toggleEditStory, approveStory,

    scenes, scenesGenStatus, scenesGenError, regeneratingSceneIds,
    approveScene, regenerateScene,
    editingMotionPromptId, setEditingMotionPromptId, updateSceneMotionPrompt,

    videos, goToVideos, approveVideo, regenerateVideo,
    activeSceneIndex, setActiveSceneIndex, previewSceneId, setPreviewSceneId,

    finalConfig, goToFinal, toggleCaptions, setMusic, setExportFormat,
    exportTransition, setExportTransition, exportStatus, exportError, exportId, startExport,

    saveStatus,
  };
}

export type AppState = ReturnType<typeof useAppState>;
