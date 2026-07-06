import express from 'express';
import cors from 'cors';
import type { ErrorRequestHandler } from 'express';
import { config, hasGoogle, hasOpenAI } from './config.js';
import { ApiError } from './apiError.js';
import { charactersRouter } from './routes/characters.js';
import { storyRouter } from './routes/story.js';
import { scenesRouter } from './routes/scenes.js';
import { imagesRouter } from './routes/images.js';
import { videosRouter } from './routes/videos.js';
import { exportRouter } from './routes/export.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    openaiConfigured: hasOpenAI(),
    googleConfigured: hasGoogle(),
  });
});

app.use('/api/characters', charactersRouter);
app.use('/api/story', storyRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/export', exportRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }
  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  console.error(err);
  res.status(500).json({ error: message, code: 'internal_error' });
};
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Anime Maker server listening on http://localhost:${config.port}`);
  if (!hasOpenAI()) console.warn('  ! OPENAI_API_KEY is not set — text generation will fail.');
  if (!hasGoogle()) console.warn('  ! GOOGLE_API_KEY is not set — image/video generation will fail.');
});
