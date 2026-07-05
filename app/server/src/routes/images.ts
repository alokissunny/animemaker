import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { generateSceneImageVariants, type ImageReference } from '../services/geminiService.js';

export const imagesRouter = Router();

interface ImagesRequestBody {
  sceneId: string;
  imagePrompt: string;
  characterRefs?: ImageReference[];
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
    const variants = await generateSceneImageVariants(imagePrompt, characterRefs || [], variantCount || 4);
    res.json({
      sceneId,
      variants: variants.map((v, id) => ({ id, imageBase64: v.imageBase64, mimeType: v.mimeType })),
    });
  })
);
