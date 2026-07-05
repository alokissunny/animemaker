import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import {
  generateScenes,
  regenerateOneScene,
  type EpisodeConfig,
  type SceneResult,
  type StoryResult,
} from '../services/openaiService.js';

export const scenesRouter = Router();

interface ScenesRequestBody {
  story: StoryResult;
  episodeConfig: EpisodeConfig;
  characters: Array<{ name: string; role: string }>;
}

scenesRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const { story, episodeConfig, characters } = req.body as ScenesRequestBody;
    if (!story?.full) {
      res.status(400).json({ error: 'An approved story is required.', code: 'invalid_request' });
      return;
    }
    const scenes = await generateScenes(story, episodeConfig, characters || []);
    res.json({ scenes });
  })
);

interface RegenerateOneBody extends ScenesRequestBody {
  previousScene: SceneResult;
}

scenesRouter.post(
  '/regenerate-one',
  asyncHandler(async (req, res) => {
    const { story, episodeConfig, characters, previousScene } = req.body as RegenerateOneBody;
    if (!story?.full || !previousScene) {
      res.status(400).json({ error: 'story and previousScene are required.', code: 'invalid_request' });
      return;
    }
    const scene = await regenerateOneScene(story, episodeConfig, characters || [], previousScene);
    res.json({ scene });
  })
);
