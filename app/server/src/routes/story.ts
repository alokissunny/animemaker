import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { generateStory, type EpisodeConfig } from '../services/openaiService.js';

export const storyRouter = Router();

interface StoryRequestBody {
  characters: Array<{ name: string; role: string; personality?: string; animeStyle?: string }>;
  episodeConfig: EpisodeConfig;
}

storyRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const { characters, episodeConfig } = req.body as StoryRequestBody;
    if (!episodeConfig?.theme) {
      res.status(400).json({ error: 'episodeConfig is required.', code: 'invalid_request' });
      return;
    }
    const story = await generateStory(characters || [], episodeConfig);
    res.json(story);
  })
);
