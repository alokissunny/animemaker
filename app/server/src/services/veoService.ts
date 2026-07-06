import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { type GenerateVideosOperation } from '@google/genai';
import { config } from '../config.js';
import { ApiError } from '../apiError.js';
import { getGoogleClient } from './googleClient.js';

interface CachedVideo {
  buffer: Buffer;
  mimeType: string;
}
const videoCache = new Map<string, CachedVideo>();

// The in-memory cache alone doesn't survive a server restart, which would break the
// "resume next session" flow for any scene video generated before the restart. Mirror
// each finished video to disk so it can still be served (and re-warmed into memory)
// afterward.
const VIDEOS_DIR = path.join(config.dataDir, 'videos');

async function persistVideoToDisk(videoId: string, buffer: Buffer, mimeType: string): Promise<void> {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });
  await fs.writeFile(path.join(VIDEOS_DIR, `${videoId}.mp4`), buffer);
  await fs.writeFile(path.join(VIDEOS_DIR, `${videoId}.json`), JSON.stringify({ mimeType }));
}

// The SDK's operation objects carry an internal _fromAPIResponse method needed to poll
// status — a plain `{ name }` object reconstructed from just the name string does NOT
// have it and throws. So we keep the real operation instances around in memory, keyed
// by name, and always poll using the last instance we have for that operation.
const operationCache = new Map<string, GenerateVideosOperation>();

export async function startVideoGeneration(params: {
  prompt: string;
  imageBase64: string;
  mimeType: string;
  durationSeconds?: number;
}): Promise<{ operationName: string }> {
  const ai = getGoogleClient();
  let operation: GenerateVideosOperation;
  try {
    operation = await ai.models.generateVideos({
      model: config.veoModel,
      prompt: params.prompt,
      image: { imageBytes: params.imageBase64, mimeType: params.mimeType },
      config: {
        numberOfVideos: 1,
        durationSeconds: params.durationSeconds ?? 6,
        aspectRatio: '16:9',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Veo error';
    throw new ApiError(502, 'veo_request_failed', `Veo video request failed: ${message}`);
  }
  if (!operation.name) {
    throw new ApiError(502, 'veo_no_operation', 'Veo did not return an operation to track.');
  }
  operationCache.set(operation.name, operation);
  return { operationName: operation.name };
}

export async function checkVideoStatus(
  operationName: string
): Promise<{ done: boolean; videoId?: string; error?: string }> {
  const ai = getGoogleClient();
  const previous = operationCache.get(operationName);
  if (!previous) {
    return {
      done: true,
      error: 'Lost track of this video generation job (the server may have restarted). Please regenerate the video.',
    };
  }
  let operation: GenerateVideosOperation;
  try {
    operation = await ai.operations.getVideosOperation({ operation: previous });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Veo error';
    throw new ApiError(502, 'veo_poll_failed', `Checking Veo status failed: ${message}`);
  }
  operationCache.set(operationName, operation);
  if (!operation.done) return { done: false };
  if (operation.error) {
    const message = typeof operation.error.message === 'string' ? operation.error.message : 'Veo reported a generation error.';
    return { done: true, error: message };
  }
  const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
  if (!generatedVideo) {
    const raiReasons = operation.response?.raiMediaFilteredReasons;
    const error = raiReasons?.length
      ? raiReasons.join(' ')
      : 'Veo finished but returned no video. Try adjusting the scene image or motion prompt.';
    return { done: true, error };
  }

  const videoId = randomUUID();
  const mimeType = generatedVideo.mimeType || 'video/mp4';
  let buffer: Buffer;

  if (generatedVideo.videoBytes) {
    buffer = Buffer.from(generatedVideo.videoBytes, 'base64');
  } else {
    const tmpPath = path.join(os.tmpdir(), `anime-maker-${videoId}.mp4`);
    try {
      await ai.files.download({ file: generatedVideo, downloadPath: tmpPath });
      buffer = await fs.readFile(tmpPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown download error';
      return { done: true, error: `Failed to download the finished video: ${message}` };
    } finally {
      await fs.rm(tmpPath, { force: true });
    }
  }

  videoCache.set(videoId, { buffer, mimeType });
  await persistVideoToDisk(videoId, buffer, mimeType);

  operationCache.delete(operationName);
  return { done: true, videoId };
}

export async function getCachedVideo(videoId: string): Promise<CachedVideo | undefined> {
  const inMemory = videoCache.get(videoId);
  if (inMemory) return inMemory;
  try {
    const buffer = await fs.readFile(path.join(VIDEOS_DIR, `${videoId}.mp4`));
    const metaRaw = await fs.readFile(path.join(VIDEOS_DIR, `${videoId}.json`), 'utf-8').catch(() => '{}');
    const meta = JSON.parse(metaRaw) as { mimeType?: string };
    const cached: CachedVideo = { buffer, mimeType: meta.mimeType || 'video/mp4' };
    videoCache.set(videoId, cached);
    return cached;
  } catch {
    return undefined;
  }
}
