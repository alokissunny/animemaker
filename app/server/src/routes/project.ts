import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { loadProject, saveProject } from '../services/projectStore.js';

export const projectRouter = Router();

projectRouter.post(
  '/save',
  asyncHandler(async (req, res) => {
    await saveProject(req.body as Record<string, unknown>);
    res.json({ ok: true });
  })
);

projectRouter.get(
  '/load',
  asyncHandler(async (_req, res) => {
    const project = await loadProject();
    res.json({ project });
  })
);
