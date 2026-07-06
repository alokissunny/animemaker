import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import {
  startExport,
  getExportStatus,
  getExportFile,
  TRANSITIONS,
  EXPORT_FORMATS,
  type TransitionType,
  type ExportFormat,
} from '../services/exportService.js';

export const exportRouter = Router();

interface GenerateBody {
  clips: { videoId: string }[];
  transition: TransitionType;
  format: ExportFormat;
}

exportRouter.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const { clips, transition, format } = req.body as GenerateBody;
    if (!Array.isArray(clips) || clips.length === 0) {
      res.status(400).json({ error: 'At least one approved clip is required.', code: 'invalid_request' });
      return;
    }
    const t = TRANSITIONS.includes(transition) ? transition : 'cut';
    const f = EXPORT_FORMATS.includes(format) ? format : 'Landscape video';
    const { exportId } = await startExport(clips, t, f);
    res.json({ exportId });
  })
);

exportRouter.post(
  '/status',
  asyncHandler(async (req, res) => {
    const { exportId } = req.body as { exportId: string };
    const job = getExportStatus(exportId);
    if (!job) {
      res.status(404).json({ error: 'Export job not found.', code: 'not_found' });
      return;
    }
    res.json({ status: job.status, error: job.error });
  })
);

exportRouter.get(
  '/file/:exportId',
  asyncHandler(async (req, res) => {
    const file = getExportFile(req.params.exportId);
    if (!file) {
      res.status(404).json({ error: 'Export not ready or has expired.', code: 'not_found' });
      return;
    }
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', 'attachment; filename="anime-episode.mp4"');
    res.setHeader('Content-Length', file.buffer.length.toString());
    res.send(file.buffer);
  })
);
