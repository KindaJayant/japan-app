import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Small response cache: memory LRU + best-effort disk (survives dev restarts).
 * On the free tier every identical rehearsal of the same label or prompt is a
 * wasted request, so we answer those from cache.
 */
const DIR = join(tmpdir(), "japan-saathi-cache");
const MAX = 200;
const mem = new Map<string, unknown>();

export const cacheKey = (...parts: unknown[]) => createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 32);

export function cacheGet<T>(key: string): T | undefined {
  if (mem.has(key)) {
    const v = mem.get(key) as T;
    mem.delete(key);
    mem.set(key, v); // LRU touch
    return v;
  }
  try {
    const v = JSON.parse(readFileSync(join(DIR, key + ".json"), "utf8")) as T;
    mem.set(key, v);
    return v;
  } catch {
    return undefined;
  }
}

export function cacheSet(key: string, value: unknown) {
  mem.set(key, value);
  if (mem.size > MAX) mem.delete(mem.keys().next().value!);
  try {
    mkdirSync(DIR, { recursive: true });
    writeFileSync(join(DIR, key + ".json"), JSON.stringify(value));
  } catch {
    /* read-only FS (serverless): memory only */
  }
}
