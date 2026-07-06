export type Screen =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'projectDetail'
  | 'characters'
  | 'episodeSetup'
  | 'story'
  | 'scenes'
  | 'videos'
  | 'final';

export const FLOW_SCREENS: Screen[] = [
  'characters',
  'episodeSetup',
  'story',
  'scenes',
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
    ageGroup: 'Preschool (3-5)',
    gender: 'Girl',
    personality: 'Cheerful',
    animeStyle: 'Storybook 2D (Peppa Pig style)',
    hairStyle: 'Twin tails',
    hairColor: '#E85D9E',
    eyeColor: '#4F8CFF',
    outfitStyle: 'Everyday casual',
    role: 'Main Character',
    prompt: '',
  };
}

export interface ExpressionVideoState {
  status: 'idle' | 'generating' | 'ready' | 'error';
  operationName?: string;
  videoId?: string;
  error?: string;
}

export interface ExpressionPreset {
  key: string;
  label: string;
  action: string;
}

export const EXPRESSION_PRESETS: ExpressionPreset[] = [
  { key: 'happy', label: 'Happy', action: 'smiles brightly, claps and bounces with joy' },
  { key: 'sad', label: 'Sad', action: 'looks a little sad, pouts and sniffles softly, then takes a deep breath' },
  { key: 'excited', label: 'Excited', action: 'jumps up and down with excitement, arms raised, cheering happily' },
  { key: 'surprised', label: 'Surprised', action: 'gasps with surprise, eyes wide, hands to cheeks' },
  { key: 'calm', label: 'Calm', action: 'takes a slow calm breath and gives a gentle peaceful smile, swaying softly' },
];

export interface Character extends CharacterDraft {
  id: string;
  bio: string;
  imageBase64: string;
  mimeType: string;
  expressionVideos?: Record<string, ExpressionVideoState>;
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
  videoPrompt: string;
  approved: boolean;
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
  id: string;
  screen: Screen;
  characters: Character[];
  episodeConfig: EpisodeConfig;
  story: Story | null;
  scenes: Scene[];
  videos: Record<string, SceneVideoState>;
  finalConfig: FinalConfig;
  createdAt?: string;
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
