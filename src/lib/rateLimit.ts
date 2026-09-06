import "server-only";

// In-memory fixed-window rate limiter, keyed per caller (IP, or IP+email for
// login). Vercel Fluid Compute reuses warm function instances across
// requests instead of spinning up one-shot containers, so this map survives
// long enough between requests on the same instance to actually throttle a
// burst - it's not a distributed limiter (a caller hitting two different
// instances gets two independent buckets), but it's a real first line of
// defense with zero extra infra. Upgrade to Upstash Redis (Vercel
// Marketplace) if abuse ever outgrows this.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Bound memory: sweep expired buckets whenever the map gets large instead of
// running a timer (nothing to clear on serverless suspend/cold start).
function sweep() {
  if (buckets.size < 5000) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

// Returns true if the call is allowed, false if the caller is over the limit
// for this window.
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

// Vercel sets x-forwarded-for on every request; take the first (client-most)
// hop rather than trusting the whole chain. Falls back to a constant key
// (effectively one shared bucket) so local dev without the header still
// exercises the limiter instead of throwing.
export function clientIpFrom(headerList: Headers): string {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "unknown";
}
