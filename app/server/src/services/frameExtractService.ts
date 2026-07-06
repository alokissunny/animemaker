import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { runFfmpeg } from './ffmpegRunner.js';

export interface ExtractedFrame {
  imageBase64: string;
  mimeType: string;
}

// Grabs the last frame of a video clip so the next scene's video can be generated
// starting from exactly where the previous one left off — that's what makes scenes
// flow into each other instead of jump-cutting between unrelated stills.
export async function extractLastFrame(videoBuffer: Buffer): Promise<ExtractedFrame> {
  const workDir = path.join(os.tmpdir(), `anime-frame-${randomUUID()}`);
  await fs.mkdir(workDir, { recursive: true });
  try {
    const inputPath = path.join(workDir, 'clip.mp4');
    const outputPath = path.join(workDir, 'frame.jpg');
    await fs.writeFile(inputPath, videoBuffer);
    // Seek to ~1s before EOF (safe for our clips, all several seconds long) and grab
    // exactly one frame. `-update 1` lets ffmpeg write a single fixed filename instead
    // of requiring an image2-sequence pattern like frame%d.jpg.
    await runFfmpeg(['-y', '-sseof', '-1', '-i', inputPath, '-update', '1', '-q:v', '3', '-frames:v', '1', outputPath]);
    const buffer = await fs.readFile(outputPath);
    return { imageBase64: buffer.toString('base64'), mimeType: 'image/jpeg' };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
