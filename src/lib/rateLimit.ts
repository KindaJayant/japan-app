/**
 * Per-visitor sliding-window limits for the AI endpoints, so one person (or a
 * bot) can't drain the shared free-tier quota during judging. In-memory: fine
 * for one instance; swap for Upstash/Redis when scaling out.
 */
const hits = new Map<string, number[]>();

export function clientId(req: Request) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value!); // bound memory
  return { ok: true };
}
