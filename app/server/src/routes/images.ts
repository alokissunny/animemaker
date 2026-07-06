import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { generateSceneImageVariants, type SceneCharacterRef } from '../services/geminiService.js';
import { shortCharacterDescriptor } from '../services/characterDescriptor.js';

export const imagesRouter = Router();

interface ImagesRequestBody {
  sceneId: string;
  imagePrompt: string;
  characterRefs?: SceneCharacterRef[];
  variantCount?: number;
}

imagesRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const { sceneId, imagePrompt, characterRefs, variantCount } = req.body as ImagesRequestBody;
    if (!sceneId || !imagePrompt) {
      res.status(400).json({ error: 'sceneId and imagePrompt are required.', code: 'invalid_request' });
      return;
    }
    const refs = characterRefs || [];
    // Anchor age/gender for each character appearing in this scene, same as character
    // portrait generation — the reference images alone don't reliably keep age/gender
    // consistent once Nano Banana re-renders the scene.
    const descriptorPrefix = refs.length
      ? `Characters in this scene: ${refs.map(shortCharacterDescriptor).join('; ')}. Keep each character's age and gender exactly as stated, matching their reference image. `
      : '';
    const finalPrompt = `${descriptorPrefix}${imagePrompt}`;
    const variants = await generateSceneImageVariants(finalPrompt, refs, variantCount || 2);
    res.json({
      sceneId,
      variants: variants.map((v, id) => ({ id, imageBase64: v.imageBase64, mimeType: v.mimeType })),
    });
  })
);
