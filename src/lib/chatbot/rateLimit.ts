// Simple in-memory sliding-window rate limiter.
// Suitable for a single Next.js instance. For multi-instance deploys, swap to Redis.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

interface CheckResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): CheckResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  // drop expired
  const cutoff = now - windowMs;
  const recent = bucket.timestamps.filter((t) => t > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, { timestamps: recent });
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });
  return { allowed: true, remaining: limit - recent.length };
}

// Best-effort GC so the map doesn't grow unbounded.
let lastSweep = Date.now();
export function sweepIfNeeded(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  const cutoff = now - windowMs;
  for (const [k, b] of buckets) {
    const fresh = b.timestamps.filter((t) => t > cutoff);
    if (fresh.length === 0) buckets.delete(k);
    else buckets.set(k, { timestamps: fresh });
  }
}
