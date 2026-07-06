import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import ffmpegPathImport from 'ffmpeg-static';

// ffmpeg-static is CJS with a plain `module.exports = <string|null>`, but its .d.ts uses
// `export default`, which NodeNext module resolution mis-types as the whole module
// namespace rather than the string. Cast through `unknown` to the real runtime shape.
export const ffmpegPath = ffmpegPathImport as unknown as string | null;

export function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof ffmpegPath !== 'string') {
      reject(new Error('ffmpeg binary not available on this server.'));
      return;
    }
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-1500)}`));
    });
  });
}

// ffmpeg-static only bundles `ffmpeg`, not `ffprobe`. `ffmpeg -i <file>` (with no output)
// still prints a "Duration: HH:MM:SS.ms" line to stderr before erroring out, which is
// enough to read a clip's duration without a second binary/dependency.
export function probeDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (typeof ffmpegPath !== 'string') {
      reject(new Error('ffmpeg binary not available on this server.'));
      return;
    }
    const proc = spawn(ffmpegPath, ['-i', filePath]);
    let stderr = '';
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('close', () => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (!match) {
        reject(new Error(`Could not read clip duration from ffmpeg output: ${stderr.slice(-500)}`));
        return;
      }
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      const seconds = Number(match[3]);
      resolve(hours * 3600 + minutes * 60 + seconds);
    });
  });
}

// Veo's generateAudio config flag isn't accepted by every backend (the Gemini Developer
// API rejects it outright), so instead of relying on that we always strip the audio
// track back out here — this way every generated clip ends up silent regardless of
// which Google backend (API key vs Vertex AI) produced it.
export async function stripAudio(inputBuffer: Buffer): Promise<Buffer> {
  const id = randomUUID();
  const inPath = path.join(os.tmpdir(), `nova-mute-in-${id}.mp4`);
  const outPath = path.join(os.tmpdir(), `nova-mute-out-${id}.mp4`);
  await fs.writeFile(inPath, inputBuffer);
  try {
    await runFfmpeg(['-y', '-i', inPath, '-c:v', 'copy', '-an', outPath]);
    return await fs.readFile(outPath);
  } finally {
    await fs.rm(inPath, { force: true });
    await fs.rm(outPath, { force: true });
  }
}
