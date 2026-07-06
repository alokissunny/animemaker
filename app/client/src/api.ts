import type { Character, CharacterDraft, EpisodeConfig, PersistedProject, Scene, Story } from './types';

// In dev, Vite proxies /api to the server (see vite.config.ts) so this can stay empty.
// In production the client and server are typically separate deployments, so set
// VITE_API_BASE_URL (e.g. https://anime-maker-server.onrender.com) at build time.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiRequestError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(data.error || `Request to ${path} failed (${res.status}).`, data.code || 'unknown_error');
  }
  return data as T;
}

export interface HealthStatus {
  ok: boolean;
  openaiConfigured: boolean;
  googleConfigured: boolean;
}

export const getHealth = async (): Promise<HealthStatus> => {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new ApiRequestError('Could not reach the Anime Maker server.', 'server_unreachable');
  return (await res.json()) as HealthStatus;
};

export interface CharacterGenerateResponse {
  bio: string;
  imagePrompt: string;
  imageBase64: string;
  mimeType: string;
}

export const generateCharacterApi = (draft: CharacterDraft) =>
  post<CharacterGenerateResponse>('/api/characters/generate', draft);

export const generateStoryApi = (
  characters: Character[],
  episodeConfig: EpisodeConfig
) =>
  post<Omit<Story, 'approved'>>('/api/story/generate', {
    characters: characters.map((c) => ({ name: c.name, role: c.role, personality: c.personality, animeStyle: c.animeStyle })),
    episodeConfig,
  });

export const generateScenesApi = (
  story: Story,
  episodeConfig: EpisodeConfig,
  characters: Character[]
) =>
  post<{ scenes: Omit<Scene, 'id' | 'approved'>[] }>('/api/scenes/generate', {
    story,
    episodeConfig,
    characters: characters.map((c) => ({ name: c.name, role: c.role })),
  });

export const regenerateOneSceneApi = (
  story: Story,
  episodeConfig: EpisodeConfig,
  characters: Character[],
  previousScene: Scene
) =>
  post<{ scene: Omit<Scene, 'id' | 'approved'> }>('/api/scenes/regenerate-one', {
    story,
    episodeConfig,
    characters: characters.map((c) => ({ name: c.name, role: c.role })),
    previousScene,
  });

export interface VideoStartResponse {
  sceneId: string;
  operationName: string;
}

export const startSceneVideoApi = (
  sceneId: string,
  imageBase64: string,
  mimeType: string,
  motionPrompt: string,
  durationSeconds: number
) =>
  post<VideoStartResponse>('/api/videos/generate', { sceneId, imageBase64, mimeType, motionPrompt, durationSeconds });

export interface VideoStatusResponse {
  done: boolean;
  videoId?: string;
  error?: string;
}

export const checkSceneVideoStatusApi = (operationName: string) =>
  post<VideoStatusResponse>('/api/videos/status', { operationName });

export const videoFileUrl = (videoId: string) => `${API_BASE}/api/videos/file/${videoId}`;

export interface LastFrameResponse {
  imageBase64: string;
  mimeType: string;
}

export const getLastFrameApi = (videoId: string) =>
  fetch(`${API_BASE}/api/videos/last-frame/${videoId}`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new ApiRequestError(data.error || 'Could not read the previous scene clip.', data.code || 'unknown_error');
      return data as LastFrameResponse;
    });

export interface ExportStartResponse {
  exportId: string;
}

export const startExportApi = (clips: { videoId: string }[], transition: string, format: string) =>
  post<ExportStartResponse>('/api/export/generate', { clips, transition, format });

export interface ExportStatusResponse {
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

export const checkExportStatusApi = (exportId: string) =>
  post<ExportStatusResponse>('/api/export/status', { exportId });

export const exportFileUrl = (exportId: string) => `${API_BASE}/api/export/file/${exportId}`;

export const dataUri = (base64: string, mimeType: string) => `data:${mimeType};base64,${base64}`;

export const loginApi = (email: string, password: string) =>
  post<{ ok: boolean }>('/api/auth/login', { email, password });

export const saveProjectApi = (project: PersistedProject) => post<{ ok: boolean }>('/api/project/save', project);

export const loadProjectApi = () =>
  fetch(`${API_BASE}/api/project/load`)
    .then((res) => res.json())
    .then((data) => data.project as PersistedProject | null)
    .catch(() => null);
