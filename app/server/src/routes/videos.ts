import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { checkVideoStatus, getCachedVideo, startVideoGeneration } from '../services/veoService.js';

export const videosRouter = Router();

interface VideoGenerateBody {
  sceneId: string;
  imageBase64: string;
  mimeType: string;
  motionPrompt: string;
  durationSeconds?: number;
}

videosRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const { sceneId, imageBase64, mimeType, motionPrompt, durationSeconds } = req.body as VideoGenerateBody;
    if (!sceneId || !imageBase64 || !motionPrompt) {
      res.status(400).json({ error: 'sceneId, imageBase64 and motionPrompt are required.', code: 'invalid_request' });
      return;
    }
    const { operationName } = await startVideoGeneration({
      prompt: motionPrompt,
      imageBase64,
      mimeType: mimeType || 'image/png',
      durationSeconds,
    });
    res.json({ sceneId, operationName });
  })
);

videosRouter.post(
  '/status',
  asyncHandler(async (req, res) => {
    const { operationName } = req.body as { operationName: string };
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required.', code: 'invalid_request' });
      return;
    }
    const status = await checkVideoStatus(operationName);
    res.json(status);
  })
);

videosRouter.get(
  '/file/:videoId',
  asyncHandler(async (req, res) => {
    const cached = getCachedVideo(req.params.videoId);
    if (!cached) {
      res.status(404).json({ error: 'Video not found or has expired.', code: 'not_found' });
      return;
    }
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('Content-Length', cached.buffer.length.toString());
    res.send(cached.buffer);
  })
);
