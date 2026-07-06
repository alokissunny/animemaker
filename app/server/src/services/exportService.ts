import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import ffmpegPathImport from 'ffmpeg-static';
import { getCachedVideo } from './veoService.js';

// ffmpeg-static is CJS with a plain `module.exports = <string|null>`, but its .d.ts uses
// `export default`, which NodeNext module resolution mis-types as the whole module
// namespace rather than the string. Cast through `unknown` to the real runtime shape.
const ffmpegPath = ffmpegPathImport as unknown as string | null;

const CROSSFADE_SECONDS = 0.6;

export const TRANSITIONS = [
  'cut',
  'fade',
  'dissolve',
  'wipeleft',
  'wiperight',
  'slideleft',
  'slideright',
  'circlecrop',
  'zoomin',
] as const;
export type TransitionType = (typeof TRANSITIONS)[number];

export const EXPORT_FORMATS = ['Landscape video', 'Square video', 'YouTube Shorts', 'Instagram Reels', 'TikTok'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

interface ExportJob {
  status: 'processing' | 'ready' | 'error';
  error?: string;
}
const exportJobs = new Map<string, ExportJob>();
const exportFiles = new Map<string, { buffer: Buffer; mimeType: string }>();

function aspectFilter(format: ExportFormat): string {
  switch (format) {
    case 'Square video':
      return 'crop=ih:ih,scale=1080:1080,setsar=1';
    case 'YouTube Shorts':
    case 'Instagram Reels':
    case 'TikTok':
      return 'crop=ih*9/16:ih,scale=1080:1920,setsar=1';
    case 'Landscape video':
    default:
      return 'scale=1920:1080,setsar=1';
  }
}

// ffmpeg-static only bundles `ffmpeg`, not `ffprobe`. `ffmpeg -i <file>` (with no output)
// still prints a "Duration: HH:MM:SS.ms" line to stderr before erroring out, which is
// enough to read each clip's duration without a second binary/dependency.
function probeDuration(filePath: string): Promise<number> {
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

function runFfmpeg(args: string[]): Promise<void> {
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

export async function startExport(
  clips: { videoId: string }[],
  transition: TransitionType,
  format: ExportFormat
): Promise<{ exportId: string }> {
  if (clips.length === 0) throw new Error('No approved clips to export.');
  const exportId = randomUUID();
  exportJobs.set(exportId, { status: 'processing' });
  void processExport(exportId, clips, transition, format).catch((err: unknown) => {
    exportJobs.set(exportId, { status: 'error', error: err instanceof Error ? err.message : 'Export failed.' });
  });
  return { exportId };
}

async function processExport(
  exportId: string,
  clips: { videoId: string }[],
  transition: TransitionType,
  format: ExportFormat
) {
  const workDir = path.join(os.tmpdir(), `anime-export-${exportId}`);
  await fs.mkdir(workDir, { recursive: true });
  try {
    const inputPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const cached = getCachedVideo(clips[i].videoId);
      if (!cached) {
        throw new Error(`Clip ${i + 1} is no longer available on the server — please regenerate it and export again.`);
      }
      const p = path.join(workDir, `clip${i}.mp4`);
      await fs.writeFile(p, cached.buffer);
      inputPaths.push(p);
    }

    const outputPath = path.join(workDir, 'output.mp4');
    const canFastCopy = transition === 'cut' && format === 'Landscape video' && inputPaths.length > 1;

    if (inputPaths.length === 1) {
      await reencodeSingle(inputPaths[0], format, outputPath);
    } else if (canFastCopy) {
      await concatCutFast(inputPaths, outputPath, workDir);
    } else if (transition === 'cut') {
      await concatCutReencode(inputPaths, format, outputPath);
    } else {
      const durations = await Promise.all(inputPaths.map(probeDuration));
      await concatWithTransitions(inputPaths, durations, transition, format, outputPath);
    }

    const buffer = await fs.readFile(outputPath);
    exportFiles.set(exportId, { buffer, mimeType: 'video/mp4' });
    exportJobs.set(exportId, { status: 'ready' });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function reencodeSingle(inputPath: string, format: ExportFormat, outputPath: string) {
  await runFfmpeg([
    '-y',
    '-i', inputPath,
    '-vf', aspectFilter(format),
    '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac',
    outputPath,
  ]);
}

async function concatCutFast(inputPaths: string[], outputPath: string, workDir: string) {
  const listPath = path.join(workDir, 'list.txt');
  const listContent = inputPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  await fs.writeFile(listPath, listContent);
  try {
    await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath]);
  } catch {
    // Stream copy needs matching codec params across all inputs — fall back to a safe re-encode.
    await concatCutReencode(inputPaths, 'Landscape video', outputPath);
  }
}

async function concatCutReencode(inputPaths: string[], format: ExportFormat, outputPath: string) {
  const inputArgs = inputPaths.flatMap((p) => ['-i', p]);
  const n = inputPaths.length;
  const filterInputs = inputPaths.map((_, i) => `[${i}:v:0][${i}:a:0]`).join('');
  const filter = `${filterInputs}concat=n=${n}:v=1:a=1[vraw][aout];[vraw]${aspectFilter(format)}[vout]`;
  await runFfmpeg([
    '-y', ...inputArgs,
    '-filter_complex', filter,
    '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac',
    outputPath,
  ]);
}

async function concatWithTransitions(
  inputPaths: string[],
  durations: number[],
  transition: TransitionType,
  format: ExportFormat,
  outputPath: string
) {
  const n = inputPaths.length;
  const inputArgs = inputPaths.flatMap((p) => ['-i', p]);
  const d = Math.min(CROSSFADE_SECONDS, ...durations.map((x) => x * 0.4));

  const videoFilters: string[] = [];
  const audioFilters: string[] = [];
  let cumulative = durations[0];
  let vLabel = '0:v';
  let aLabel = '0:a';
  for (let i = 1; i < n; i++) {
    const offset = Math.max(0, cumulative - d);
    const isLast = i === n - 1;
    const vOut = isLast ? 'vraw' : `v${i}`;
    const aOut = isLast ? 'aout' : `a${i}`;
    videoFilters.push(
      `[${vLabel}][${i}:v]xfade=transition=${transition}:duration=${d.toFixed(3)}:offset=${offset.toFixed(3)}[${vOut}]`
    );
    audioFilters.push(`[${aLabel}][${i}:a]acrossfade=d=${d.toFixed(3)}[${aOut}]`);
    vLabel = vOut;
    aLabel = aOut;
    cumulative = cumulative + durations[i] - d;
  }
  videoFilters.push(`[vraw]${aspectFilter(format)}[vout]`);

  const filterComplex = [...videoFilters, ...audioFilters].join(';');

  await runFfmpeg([
    '-y', ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac',
    outputPath,
  ]);
}

export function getExportStatus(exportId: string): ExportJob | undefined {
  return exportJobs.get(exportId);
}

export function getExportFile(exportId: string): { buffer: Buffer; mimeType: string } | undefined {
  return exportFiles.get(exportId);
}
