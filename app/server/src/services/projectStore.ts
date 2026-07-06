import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

const PROJECT_FILE = path.join(config.dataDir, 'project.json');

// Single-slot project persistence: this MVP has exactly one in-progress episode at a
// time (no user accounts / multi-project management), so we just persist whatever
// serializable state blob the client sends verbatim, keyed by nothing but the file path.
export async function saveProject(state: Record<string, unknown>): Promise<void> {
  await fs.mkdir(config.dataDir, { recursive: true });
  const payload = JSON.stringify({ ...state, updatedAt: new Date().toISOString() });
  await fs.writeFile(PROJECT_FILE, payload, 'utf-8');
}

export async function loadProject(): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(PROJECT_FILE, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
