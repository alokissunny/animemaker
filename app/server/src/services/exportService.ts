import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getCachedVideo } from './veoService.js';
import { probeDuration, runFfmpeg } from './ffmpegRunner.js';

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
      const cached = await getCachedVideo(clips[i].videoId);
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
