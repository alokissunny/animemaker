import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { generateCharacterProfile, type CharacterDraft } from '../services/openaiService.js';
import { generateCharacterImage } from '../services/geminiService.js';

export const charactersRouter = Router();

charactersRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const draft = req.body as CharacterDraft;
    if (!draft?.name) {
      res.status(400).json({ error: 'Character name is required.', code: 'invalid_request' });
      return;
    }

    const profile = await generateCharacterProfile(draft);
    const image = await generateCharacterImage(profile.imagePrompt);

    res.json({
      bio: profile.bio,
      imagePrompt: profile.imagePrompt,
      imageBase64: image.imageBase64,
      mimeType: image.mimeType,
    });
  })
);
