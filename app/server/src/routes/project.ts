import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { listProjects, loadProject, saveProject } from '../services/projectStore.js';

export const projectRouter = Router();

projectRouter.post(
  '/save',
  asyncHandler(async (req, res) => {
    const { id, ...state } = req.body as Record<string, unknown> & { id?: string };
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'id is required.', code: 'invalid_request' });
      return;
    }
    const record = await saveProject(id, state);
    res.json({ ok: true, updatedAt: record.updatedAt });
  })
);

projectRouter.get(
  '/list',
  asyncHandler(async (_req, res) => {
    const projects = await listProjects();
    res.json({ projects });
  })
);

projectRouter.get(
  '/load/:id',
  asyncHandler(async (req, res) => {
    const project = await loadProject(req.params.id);
    res.json({ project });
  })
);
