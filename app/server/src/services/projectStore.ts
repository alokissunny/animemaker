import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

const PROJECTS_DIR = path.join(config.dataDir, 'projects');

export interface ProjectRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

function projectFile(id: string): string {
  return path.join(PROJECTS_DIR, `${id}.json`);
}

export async function saveProject(id: string, state: Record<string, unknown>): Promise<ProjectRecord> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const existing = await loadProject(id);
  const record: ProjectRecord = {
    ...state,
    id,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(projectFile(id), JSON.stringify(record), 'utf-8');
  return record;
}

export async function loadProject(id: string): Promise<ProjectRecord | null> {
  try {
    const raw = await fs.readFile(projectFile(id), 'utf-8');
    return JSON.parse(raw) as ProjectRecord;
  } catch {
    return null;
  }
}

// Every past project, newest first, so the Dashboard can list and resume any of them.
export async function listProjects(): Promise<ProjectRecord[]> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const files = await fs.readdir(PROJECTS_DIR);
  const records = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => JSON.parse(await fs.readFile(path.join(PROJECTS_DIR, f), 'utf-8')) as ProjectRecord)
  );
  return records.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}
