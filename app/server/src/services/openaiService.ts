import OpenAI from 'openai';
import { config, hasOpenAI } from '../config.js';
import { ApiError, missingKeyError } from '../apiError.js';

let client: OpenAI | null = null;
const getClient = () => {
  if (!hasOpenAI()) throw missingKeyError('OPENAI_API_KEY');
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
};

async function askForJson<T>(system: string, user: string): Promise<T> {
  const openai = getClient();
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: config.openaiTextModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown OpenAI error';
    throw new ApiError(502, 'openai_request_failed', `OpenAI request failed: ${message}`);
  }
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new ApiError(502, 'openai_empty_response', 'OpenAI returned an empty response.');
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiError(502, 'openai_bad_json', 'OpenAI response could not be parsed as JSON.');
  }
}

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

export interface CharacterProfile {
  bio: string;
  imagePrompt: string;
}

export async function generateCharacterProfile(draft: CharacterDraft): Promise<CharacterProfile> {
  const system =
    'You are the character-generation model inside an anime production app. ' +
    'Given structured character choices, write (1) a punchy one-sentence bio for the creator ' +
    'and (2) a detailed, vivid text-to-image prompt describing the character portrait for an anime-style image generator. ' +
    'Respond as JSON: {"bio": string, "imagePrompt": string}.';
  const user = JSON.stringify(draft);
  return askForJson<CharacterProfile>(system, user);
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

export interface StoryResult {
  title: string;
  synopsis: string;
  beginning: string;
  middle: string;
  ending: string;
  full: string;
  roleChips: RoleChip[];
}

export async function generateStory(
  characters: Array<{ name: string; role: string; personality?: string; animeStyle?: string }>,
  episodeConfig: EpisodeConfig
): Promise<StoryResult> {
  const system =
    'You are the story-generation model inside an anime production app called Nova. ' +
    'Write a complete, wholesome, family-friendly original anime episode story from the given characters and episode settings. ' +
    'Never reuse existing copyrighted IP or character names from existing franchises — always invent an original story. ' +
    'Respond as JSON with exactly these keys: ' +
    '{"title": string, "synopsis": string, "beginning": string, "middle": string, "ending": string, "full": string, "roleChips": [{"name": string, "role": string}]}. ' +
    '"full" should be the complete narrated story, several paragraphs long, written in plain prose (not a scene list).';
  const user = JSON.stringify({ characters, episodeConfig });
  return askForJson<StoryResult>(system, user);
}

export interface SceneResult {
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
}

export async function generateScenes(
  story: StoryResult,
  episodeConfig: EpisodeConfig,
  characters: Array<{ name: string; role: string }>
): Promise<SceneResult[]> {
  const system =
    'You are the scene-breakdown model and caption/dialogue generator inside an anime production app. ' +
    `Break the given approved story into exactly ${episodeConfig.numScenes} sequential scenes suitable for short anime clips. ` +
    'For each scene provide: number, title, description (what happens, 1-2 sentences), charactersInvolved (comma separated names), ' +
    'location, camera (a camera angle/shot type), mood, action (concrete visual action for the animator), ' +
    'caption (a short spoken line of dialogue or narration for that scene), ' +
    'imagePrompt (a detailed anime-style text-to-image prompt for this scene, mentioning the characters, setting, and mood), ' +
    'videoPrompt (a short motion/camera direction describing how to animate the still image into a clip). ' +
    'Respond as JSON: {"scenes": [ ... ]} matching this shape exactly.';
  const user = JSON.stringify({ story, episodeConfig, characters });
  const result = await askForJson<{ scenes: SceneResult[] }>(system, user);
  if (!Array.isArray(result.scenes) || result.scenes.length === 0) {
    throw new ApiError(502, 'openai_bad_scenes', 'OpenAI did not return a usable scene list.');
  }
  return result.scenes;
}

export async function regenerateOneScene(
  story: StoryResult,
  episodeConfig: EpisodeConfig,
  characters: Array<{ name: string; role: string }>,
  previousScene: SceneResult
): Promise<SceneResult> {
  const system =
    'You are the scene-breakdown model and caption/dialogue generator inside an anime production app. ' +
    'The creator disliked one scene from an already-approved story and wants a fresh alternate take on the same beat of the story. ' +
    'Keep the same scene number and the same rough position in the story, but vary the staging, camera, mood, action, or caption. ' +
    'Provide: number, title, description, charactersInvolved (comma separated names), location, camera, mood, action, caption, imagePrompt, videoPrompt. ' +
    'Respond as JSON: {"scene": { ... }} matching this shape exactly.';
  const user = JSON.stringify({ story, episodeConfig, characters, previousScene });
  const result = await askForJson<{ scene: SceneResult }>(system, user);
  if (!result.scene) {
    throw new ApiError(502, 'openai_bad_scene', 'OpenAI did not return a usable scene.');
  }
  return result.scene;
}
