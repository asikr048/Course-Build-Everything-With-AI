import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

/**
 * Universal document store.
 *
 * - In production (Vercel) set DATABASE_URL to a Neon Postgres connection
 *   string. Each "document" (config, projects, …) is stored as one JSONB row
 *   in a single `site_kv` table. This persists across serverless invocations,
 *   which the read-only filesystem cannot.
 * - In local development with no DATABASE_URL, documents fall back to the
 *   JSON files in /data so the app works with zero setup.
 *
 * On first read of a key against Neon, the bundled /data/<key>.json is used as
 * the seed value, so a fresh database is populated automatically.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const connectionString = process.env.DATABASE_URL;
const sql = connectionString ? neon(connectionString) : null;

export const usingDatabase = Boolean(sql);

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS site_kv (
          key        TEXT PRIMARY KEY,
          value      JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })().catch((e) => {
      tableReady = null;
      throw e;
    });
  }
  return tableReady;
}

/** Read the bundled default JSON shipped in /data (read-only safe on Vercel). */
function readBundledDefault<T>(key: string): T | null {
  try {
    const file = path.join(DATA_DIR, `${key}.json`);
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

/**
 * Get a document by key. Falls back to the provided default, then to the
 * bundled /data/<key>.json, then to an empty object.
 */
export async function getDoc<T>(key: string, fallback?: T): Promise<T> {
  if (sql) {
    await ensureTable();
    const rows = (await sql`SELECT value FROM site_kv WHERE key = ${key}`) as { value: T }[];
    if (rows.length) return rows[0].value;

    // Seed a fresh database from the bundled default (or the caller's default).
    const seed = fallback ?? readBundledDefault<T>(key);
    if (seed != null) {
      await setDoc(key, seed);
      return seed;
    }
    return (fallback ?? ({} as T));
  }

  // File mode (local dev)
  const fileValue = readBundledDefault<T>(key);
  if (fileValue != null) return fileValue;
  return (fallback ?? ({} as T));
}

/** Persist a document by key. */
export async function setDoc<T>(key: string, value: T): Promise<void> {
  if (sql) {
    await ensureTable();
    await sql`
      INSERT INTO site_kv (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return;
  }

  const file = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf-8");
}

/**
 * Merge a partial patch into an existing document and persist the result.
 * Returns the merged document.
 */
export async function patchDoc<T extends Record<string, unknown>>(
  key: string,
  patch: Partial<T>,
): Promise<T> {
  const current = await getDoc<T>(key, {} as T);
  const merged = { ...current, ...patch } as T;
  await setDoc(key, merged);
  return merged;
}
