import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { generateCharacterProfile, type CharacterDraft } from '../services/openaiService.js';
import { generateCharacterImage } from '../services/geminiService.js';
import { buildCharacterDescriptor } from '../services/characterDescriptor.js';

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
    // The deterministic descriptor goes first so age/gender/appearance are anchored
    // regardless of how the LLM's freeform imagePrompt phrases things.
    const finalImagePrompt = `${buildCharacterDescriptor(draft)} ${profile.imagePrompt} Portrait framing, single character, plain background.`;
    const image = await generateCharacterImage(finalImagePrompt);

    res.json({
      bio: profile.bio,
      imagePrompt: finalImagePrompt,
      imageBase64: image.imageBase64,
      mimeType: image.mimeType,
    });
  })
);
