import 'dotenv/config';
import pg from 'pg';
import { defaultProfile, defaultEmissions } from './defaultData.js';
import { normalizeEntry } from './calculations.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      household_size INTEGER NOT NULL,
      annual_target NUMERIC NOT NULL,
      persona VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS emissions (
      id SERIAL PRIMARY KEY,
      month VARCHAR(255) NOT NULL UNIQUE,
      transport NUMERIC NOT NULL DEFAULT 0,
      home NUMERIC NOT NULL DEFAULT 0,
      food NUMERIC NOT NULL DEFAULT 0,
      shopping NUMERIC NOT NULL DEFAULT 0,
      total NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const profileResult = await pool.query('SELECT * FROM profile LIMIT 1');
  if (profileResult.rows.length === 0) {
    await pool.query(
      'INSERT INTO profile (name, location, household_size, annual_target, persona) VALUES ($1, $2, $3, $4, $5)',
      [
        defaultProfile.name,
        defaultProfile.location,
        defaultProfile.householdSize,
        defaultProfile.annualTarget,
        defaultProfile.persona
      ]
    );
  }

  const emissionsResult = await pool.query('SELECT * FROM emissions LIMIT 1');
  if (emissionsResult.rows.length === 0) {
    for (const emission of defaultEmissions) {
      await pool.query(
        'INSERT INTO emissions (month, transport, home, food, shopping, total) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          emission.month,
          emission.transport,
          emission.home,
          emission.food,
          emission.shopping,
          emission.total
        ]
      );
    }
  }
}

export async function readState() {
  await ensureSchema();

  const profileResult = await pool.query('SELECT * FROM profile LIMIT 1');
  const profile = profileResult.rows[0];

  const emissionsResult = await pool.query('SELECT * FROM emissions ORDER BY id');
  const emissions = emissionsResult.rows.map(row => ({
    month: row.month,
    transport: parseFloat(row.transport),
    home: parseFloat(row.home),
    food: parseFloat(row.food),
    shopping: parseFloat(row.shopping),
    total: parseFloat(row.total)
  }));

  return {
    profile: {
      name: profile.name,
      location: profile.location,
      householdSize: profile.household_size,
      annualTarget: parseFloat(profile.annual_target),
      persona: profile.persona
    },
    emissions: emissions.map(normalizeEntry).filter((entry) => entry.month)
  };
}

export async function writeState(state) {
  await ensureSchema();

  await pool.query(
    'UPDATE profile SET name = $1, location = $2, household_size = $3, annual_target = $4, persona = $5, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM profile LIMIT 1)',
    [
      state.profile.name,
      state.profile.location,
      state.profile.householdSize,
      state.profile.annualTarget,
      state.profile.persona
    ]
  );

  await pool.query('DELETE FROM emissions');
  for (const emission of state.emissions) {
    await pool.query(
      'INSERT INTO emissions (month, transport, home, food, shopping, total) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        emission.month,
        emission.transport,
        emission.home,
        emission.food,
        emission.shopping,
        emission.total
      ]
    );
  }

  return state;
}

export async function updateProfile(profile) {
  await ensureSchema();

  const currentState = await readState();
  const newProfile = { ...currentState.profile, ...profile };

  await pool.query(
    'UPDATE profile SET name = $1, location = $2, household_size = $3, annual_target = $4, persona = $5, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM profile LIMIT 1)',
    [
      newProfile.name,
      newProfile.location,
      newProfile.householdSize,
      newProfile.annualTarget,
      newProfile.persona
    ]
  );

  return readState();
}

export async function upsertEmission(entry) {
  await ensureSchema();

  const normalized = normalizeEntry(entry);
  if (!normalized.month) {
    const error = new Error('month is required');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query('SELECT id FROM emissions WHERE month = $1', [normalized.month]);

  if (result.rows.length > 0) {
    await pool.query(
      'UPDATE emissions SET transport = $1, home = $2, food = $3, shopping = $4, total = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
      [
        normalized.transport,
        normalized.home,
        normalized.food,
        normalized.shopping,
        normalized.total,
        result.rows[0].id
      ]
    );
  } else {
    await pool.query(
      'INSERT INTO emissions (month, transport, home, food, shopping, total) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        normalized.month,
        normalized.transport,
        normalized.home,
        normalized.food,
        normalized.shopping,
        normalized.total
      ]
    );
  }

  return readState();
}

export async function patchEmission(month, fields) {
  await ensureSchema();

  const result = await pool.query('SELECT * FROM emissions WHERE month = $1', [month]);
  if (result.rows.length === 0) {
    const error = new Error('emission entry not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = result.rows[0];
  const updated = normalizeEntry({
    month: existing.month,
    transport: parseFloat(existing.transport),
    home: parseFloat(existing.home),
    food: parseFloat(existing.food),
    shopping: parseFloat(existing.shopping),
    total: parseFloat(existing.total),
    ...fields
  });

  await pool.query(
    'UPDATE emissions SET transport = $1, home = $2, food = $3, shopping = $4, total = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
    [
      updated.transport,
      updated.home,
      updated.food,
      updated.shopping,
      updated.total,
      existing.id
    ]
  );

  return readState();
}

export { pool };
