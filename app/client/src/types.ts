export type Screen =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'projectDetail'
  | 'characters'
  | 'episodeSetup'
  | 'story'
  | 'scenes'
  | 'images'
  | 'videos'
  | 'final';

export const FLOW_SCREENS: Screen[] = [
  'characters',
  'episodeSetup',
  'story',
  'scenes',
  'images',
  'videos',
  'final',
];

export interface CharacterDraft {
  name: string;
  ageGroup: string;
  gender: string;
  personality: string;
  animeStyle: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfitStyle: string;
  role: string;
  prompt: string;
}

export function blankDraft(): CharacterDraft {
  return {
    name: '',
    ageGroup: 'Kid (5-9)',
    gender: 'Girl',
    personality: 'Cheerful',
    animeStyle: 'Chibi / Cute',
    hairStyle: 'Twin tails',
    hairColor: '#E85D9E',
    eyeColor: '#4F8CFF',
    outfitStyle: 'Everyday casual',
    role: 'Hero',
    prompt: '',
  };
}

export interface Character extends CharacterDraft {
  id: string;
  bio: string;
  imageBase64: string;
  mimeType: string;
}

export interface EpisodeConfig {
  theme: string;
  duration: string;
  audience: string;
  mood: string;
  visualStyle: string;
  language: string;
  numScenes: number;
  idea: string;
}

export interface RoleChip {
  name: string;
  role: string;
}

export interface Story {
  title: string;
  synopsis: string;
  beginning: string;
  middle: string;
  ending: string;
  full: string;
  roleChips: RoleChip[];
  approved: boolean;
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  description: string;
  charactersInvolved: string;
  location: string;
  camera: string;
  mood: string;
  action: string;
  caption: string;
  imagePrompt: string;
  videoPrompt: string;
  approved: boolean;
}

export interface ImageVariant {
  id: number;
  imageBase64: string;
  mimeType: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'ready' | 'approved' | 'error';

export interface SceneImageState {
  status: GenerationStatus;
  variants: ImageVariant[];
  selectedVariant: number | null;
  error?: string;
}

export interface SceneVideoState {
  status: 'idle' | 'starting' | 'generating' | 'ready' | 'approved' | 'error';
  operationName?: string;
  videoId?: string;
  error?: string;
}

export interface FinalConfig {
  captionsOn: boolean;
  music: string;
  format: string;
}

export const TRANSITION_OPTIONS: { value: string; label: string }[] = [
  { value: 'cut', label: 'Cut' },
  { value: 'fade', label: 'Fade' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'wipeleft', label: 'Wipe Left' },
  { value: 'wiperight', label: 'Wipe Right' },
  { value: 'slideleft', label: 'Slide Left' },
  { value: 'slideright', label: 'Slide Right' },
  { value: 'circlecrop', label: 'Circle Crop' },
  { value: 'zoomin', label: 'Zoom In' },
];

export type ExportJobStatus = 'idle' | 'processing' | 'ready' | 'error';

export interface PersistedProject {
  screen: Screen;
  characters: Character[];
  episodeConfig: EpisodeConfig;
  story: Story | null;
  scenes: Scene[];
  images: Record<string, SceneImageState>;
  videos: Record<string, SceneVideoState>;
  finalConfig: FinalConfig;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  meta: string;
  initials: string;
  statusLabel: string;
  progressPct: string;
  thumbGradient: string;
}
