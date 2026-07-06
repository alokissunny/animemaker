import { useCallback, useEffect, useRef, useState } from 'react';
import {
  checkExportStatusApi,
  checkSceneVideoStatusApi,
  generateCharacterApi,
  generateSceneImagesApi,
  generateScenesApi,
  generateStoryApi,
  loadProjectApi,
  regenerateOneSceneApi,
  saveProjectApi,
  startExportApi,
  startSceneVideoApi,
} from '../api';
import {
  blankDraft,
  FLOW_SCREENS,
  type Character,
  type CharacterDraft,
  type EpisodeConfig,
  type ExportJobStatus,
  type FinalConfig,
  type PersistedProject,
  type Scene,
  type SceneImageState,
  type SceneVideoState,
  type Screen,
  type Story,
} from '../types';

const SAMPLE_PROJECTS = [
  { id: 'p1', title: "Momo's Rainy Day", meta: '4 characters · Friendship · 2 min', initials: 'MR', statusLabel: 'Video Ready', progressPct: '100%', thumbGradient: 'linear-gradient(135deg,#3B2E6B,#6B3E7A)' },
  { id: 'p2', title: 'Starlight Academy', meta: '3 characters · School life · 1 min', initials: 'SA', statusLabel: 'Images Generated', progressPct: '78%', thumbGradient: 'linear-gradient(135deg,#2E4B6B,#3E6B85)' },
  { id: 'p3', title: 'The Last Ember', meta: '5 characters · Fantasy · 3 min', initials: 'LE', statusLabel: 'Story Approved', progressPct: '42%', thumbGradient: 'linear-gradient(135deg,#6B2E3E,#8A3E4F)' },
  { id: 'p4', title: 'Untitled Draft', meta: '1 character · Not started', initials: 'UD', statusLabel: 'Draft', progressPct: '10%', thumbGradient: 'linear-gradient(135deg,#2A283C,#3A3750)' },
];

function durationSecondsForScene(episodeConfig: EpisodeConfig): number {
  const totalSeconds =
    { '30 seconds': 30, '1 minute': 60, '2 minutes': 120, '3 minutes': 180, '5 minutes': 300 }[episodeConfig.duration] ?? 60;
  const perScene = totalSeconds / Math.max(1, episodeConfig.numScenes);
  return Math.max(4, Math.min(8, Math.round(perScene)));
}

function pickCharacterRefs(scene: { charactersInvolved: string }, characters: Character[]) {
  const names = scene.charactersInvolved.split(',').map((n) => n.trim().toLowerCase());
  const matched = characters.filter((c) => names.includes(c.name.toLowerCase()));
  const refs = (matched.length ? matched : characters).slice(0, 2);
  return refs.map((c) => ({
    imageBase64: c.imageBase64,
    mimeType: c.mimeType,
    name: c.name,
    ageGroup: c.ageGroup,
    gender: c.gender,
  }));
}

export function useAppState() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [selectedProjectId, setSelectedProjectId] = useState('p1');

  const [charTab, setCharTab] = useState<'create' | 'gallery'>('create');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [draft, setDraft] = useState<CharacterDraft>(blankDraft());
  const [charGenStatus, setCharGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [charGenError, setCharGenError] = useState<string | null>(null);
  const [charGenResult, setCharGenResult] = useState<{ bio: string; imageBase64: string; mimeType: string } | null>(null);

  const [episodeConfig, setEpisodeConfig] = useState<EpisodeConfig>({
    theme: 'Friendship',
    duration: '1 minute',
    audience: 'Kids (5-9)',
    mood: 'Wholesome',
    visualStyle: 'Soft pastel anime',
    language: 'English',
    numScenes: 5,
    idea: '',
  });

  const [story, setStory] = useState<Story | null>(null);
  const [storyGenStatus, setStoryGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [storyGenError, setStoryGenError] = useState<string | null>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scenesGenStatus, setScenesGenStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [scenesGenError, setScenesGenError] = useState<string | null>(null);
  const [regeneratingSceneIds, setRegeneratingSceneIds] = useState<Record<string, boolean>>({});
  const [editingScenePromptId, setEditingScenePromptId] = useState<string | null>(null);
  const [editingMotionPromptId, setEditingMotionPromptId] = useState<string | null>(null);

  const [images, setImages] = useState<Record<string, SceneImageState>>({});
  const [videos, setVideos] = useState<Record<string, SceneVideoState>>({});
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);

  const [finalConfig, setFinalConfig] = useState<FinalConfig>({
    captionsOn: true,
    music: 'Warm acoustic (default)',
    format: 'YouTube Shorts',
  });
  const [exportTransition, setExportTransition] = useState('fade');
  const [exportStatus, setExportStatus] = useState<ExportJobStatus>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);

  const goLanding = useCallback(() => setScreen('landing'), []);
  const goLogin = useCallback(() => setScreen('login'), []);
  const goDashboard = useCallback(() => setScreen('dashboard'), []);
  const startNewEpisode = useCallback(() => setScreen('characters'), []);
  const openProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    setScreen('projectDetail');
  }, []);
  const resumeProject = useCallback(() => setScreen('characters'), []);

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

  const updateScenePrompt = useCallback((id: string, imagePrompt: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, imagePrompt } : s)));
  }, []);
  const updateSceneMotionPrompt = useCallback((id: string, videoPrompt: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, videoPrompt } : s)));
  }, []);

  const generateImageForScene = useCallback(
    async (scene: Scene) => {
      setImages((prev) => ({ ...prev, [scene.id]: { status: 'generating', variants: [], selectedVariant: null } }));
      try {
        const refs = pickCharacterRefs(scene, characters);
        const result = await generateSceneImagesApi(scene.id, scene.imagePrompt, refs);
        setImages((prev) => ({
          ...prev,
          [scene.id]: { status: 'ready', variants: result.variants, selectedVariant: result.variants[0]?.id ?? null },
        }));
      } catch (err) {
        setImages((prev) => ({
          ...prev,
          [scene.id]: {
            status: 'error',
            variants: [],
            selectedVariant: null,
            error: err instanceof Error ? err.message : 'Image generation failed.',
          },
        }));
      }
    },
    [characters]
  );

  const goToImages = useCallback(() => {
    setScreen('images');
    scenes.forEach((scene) => void generateImageForScene(scene));
  }, [scenes, generateImageForScene]);

  const selectImageVariant = useCallback((sceneId: string, variantId: number) => {
    setImages((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], status: 'ready', selectedVariant: variantId } }));
  }, []);
  const approveImage = useCallback((sceneId: string) => {
    setImages((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], status: 'approved' } }));
  }, []);
  const regenerateImage = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) void generateImageForScene(scene);
    },
    [scenes, generateImageForScene]
  );

  const startVideoForScene = useCallback(
    async (scene: Scene) => {
      const im = images[scene.id];
      const variant = im?.variants.find((v) => v.id === im.selectedVariant) ?? im?.variants[0];
      if (!variant) return;
      setVideos((prev) => ({ ...prev, [scene.id]: { status: 'generating' } }));
      try {
        const { operationName } = await startSceneVideoApi(
          scene.id,
          variant.imageBase64,
          variant.mimeType,
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
    [images, episodeConfig]
  );

  const goToVideos = useCallback(() => {
    setScreen('videos');
    scenes.forEach((scene) => void startVideoForScene(scene));
  }, [scenes, startVideoForScene]);

  const approveVideo = useCallback((sceneId: string) => {
    setVideos((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], status: 'approved' } }));
  }, []);
  const regenerateVideo = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) void startVideoForScene(scene);
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

  const [savedProject, setSavedProject] = useState<PersistedProject | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load whatever project was last saved (if any) once on mount, so the Dashboard can
  // offer to resume it. This only fetches — it doesn't touch current in-memory state.
  useEffect(() => {
    loadProjectApi().then((project) => {
      if (project) setSavedProject(project);
    });
  }, []);

  const resumeSavedProject = useCallback(() => {
    if (!savedProject) return;
    setCharacters(savedProject.characters);
    setEpisodeConfig(savedProject.episodeConfig);
    setStory(savedProject.story);
    setStoryGenStatus(savedProject.story ? 'ready' : 'idle');
    setScenes(savedProject.scenes);
    setScenesGenStatus(savedProject.scenes.length > 0 ? 'ready' : 'idle');
    setImages(savedProject.images);
    setVideos(savedProject.videos);
    setFinalConfig(savedProject.finalConfig);
    setScreen(savedProject.screen);
  }, [savedProject]);

  // Autosave: debounced so we're not writing on every keystroke, and skipped until
  // there's actually a project worth saving (a character or scene exists).
  const hasSaveableContent = characters.length > 0 || scenes.length > 0;
  useEffect(() => {
    if (!hasSaveableContent) return;
    setSaveStatus('saving');
    const timeout = setTimeout(() => {
      saveProjectApi({ screen, characters, episodeConfig, story, scenes, images, videos, finalConfig })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('idle'));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [hasSaveableContent, screen, characters, episodeConfig, story, scenes, images, videos, finalConfig]);

  return {
    screen, setScreen, jumpToStep,
    authTab, setAuthTab,
    selectedProjectId, projects: SAMPLE_PROJECTS,
    goLanding, goLogin, goDashboard, startNewEpisode, openProject, resumeProject,

    charTab, setCharTab, characters, draft, setDraftField, setDraftRole,
    charGenStatus, charGenError, charGenResult, generateCharacter, saveCharacter,
    continueToEpisodeSetup,

    episodeConfig, setEpisodeField,
    story, storyGenStatus, storyGenError, isEditingStory,
    generateStoryAction, regenerateStory, setStoryFull, toggleEditStory, approveStory,

    scenes, scenesGenStatus, scenesGenError, regeneratingSceneIds,
    approveScene, regenerateScene,
    editingScenePromptId, setEditingScenePromptId, updateScenePrompt,
    editingMotionPromptId, setEditingMotionPromptId, updateSceneMotionPrompt,

    images, goToImages, selectImageVariant, approveImage, regenerateImage,

    videos, goToVideos, approveVideo, regenerateVideo,
    activeSceneIndex, setActiveSceneIndex, previewSceneId, setPreviewSceneId,

    finalConfig, goToFinal, toggleCaptions, setMusic, setExportFormat,
    exportTransition, setExportTransition, exportStatus, exportError, exportId, startExport,

    savedProject, resumeSavedProject, saveStatus,
  };
}

export type AppState = ReturnType<typeof useAppState>;
