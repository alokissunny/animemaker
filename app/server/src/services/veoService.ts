import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI, type GenerateVideosOperation } from '@google/genai';
import { config, hasGoogle } from '../config.js';
import { ApiError, missingKeyError } from '../apiError.js';

let client: GoogleGenAI | null = null;
const getClient = () => {
  if (!hasGoogle()) throw missingKeyError('GOOGLE_API_KEY');
  if (!client) client = new GoogleGenAI({ apiKey: config.googleApiKey });
  return client;
};

interface CachedVideo {
  buffer: Buffer;
  mimeType: string;
}
const videoCache = new Map<string, CachedVideo>();

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
  const ai = getClient();
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
  const ai = getClient();
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
    return { done: true, error: 'Veo finished but returned no video.' };
  }

  const videoId = randomUUID();
  const mimeType = generatedVideo.mimeType || 'video/mp4';

  if (generatedVideo.videoBytes) {
    videoCache.set(videoId, { buffer: Buffer.from(generatedVideo.videoBytes, 'base64'), mimeType });
  } else {
    const tmpPath = path.join(os.tmpdir(), `anime-maker-${videoId}.mp4`);
    try {
      await ai.files.download({ file: generatedVideo, downloadPath: tmpPath });
      const buffer = await fs.readFile(tmpPath);
      videoCache.set(videoId, { buffer, mimeType });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown download error';
      return { done: true, error: `Failed to download the finished video: ${message}` };
    } finally {
      await fs.rm(tmpPath, { force: true });
    }
  }

  operationCache.delete(operationName);
  return { done: true, videoId };
}

export function getCachedVideo(videoId: string): CachedVideo | undefined {
  return videoCache.get(videoId);
}
