import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultState } from './defaultData.js';
import { normalizeEntry } from './calculations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, '..', 'data', 'carbon-data.json');

async function ensureDataFile() {
  await mkdir(dirname(dataFile), { recursive: true });

  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeState(defaultState);
  }
}

export async function readState() {
  await ensureDataFile();
  const raw = await readFile(dataFile, 'utf8');
  const parsed = JSON.parse(raw);

  return {
    profile: { ...defaultState.profile, ...(parsed.profile || {}) },
    emissions: Array.isArray(parsed.emissions)
      ? parsed.emissions.map(normalizeEntry).filter((entry) => entry.month)
      : defaultState.emissions
  };
}

export async function writeState(state) {
  await mkdir(dirname(dataFile), { recursive: true });
  const nextState = {
    profile: { ...defaultState.profile, ...(state.profile || {}) },
    emissions: (state.emissions || []).map(normalizeEntry).filter((entry) => entry.month)
  };

  await writeFile(dataFile, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
  return nextState;
}

export async function updateProfile(profile) {
  const state = await readState();
  state.profile = { ...state.profile, ...profile };
  return writeState(state);
}

export async function upsertEmission(entry) {
  const state = await readState();
  const normalized = normalizeEntry(entry);
  if (!normalized.month) {
    const error = new Error('month is required');
    error.statusCode = 400;
    throw error;
  }

  const index = state.emissions.findIndex((item) => item.month.toLowerCase() === normalized.month.toLowerCase());
  if (index >= 0) {
    state.emissions[index] = normalized;
  } else {
    state.emissions.push(normalized);
  }

  return writeState(state);
}

export async function patchEmission(month, fields) {
  const state = await readState();
  const index = state.emissions.findIndex((item) => item.month.toLowerCase() === month.toLowerCase());
  if (index < 0) {
    const error = new Error('emission entry not found');
    error.statusCode = 404;
    throw error;
  }

  state.emissions[index] = normalizeEntry({ ...state.emissions[index], ...fields, month: state.emissions[index].month });
  return writeState(state);
}
