/**
 * Shared server-side form-security helpers: input sanitization, email
 * validation, HTML escaping for e-mail templates, honeypot and a best-effort
 * in-memory rate limiter. Used by the public form API routes (contact,
 * investor, valuation).
 *
 * NOTE: the rate limiter is per-instance and in-memory. In a serverless /
 * multi-instance deployment it is best-effort only (mitigates naive bursts,
 * not a distributed attack). A durable limiter (DB / KV) is a P2 follow-up.
 */

export function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length < 5 || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Trim and hard-cap a free-text field. Returns '' for non-strings. */
export function sanitizeString(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return '';
  // strip control chars, collapse, trim, cap length
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLen);
}

/** Escape user input before embedding it inside an HTML e-mail template. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Honeypot check. Public forms include a hidden field (e.g. `website`) that a
 * human never fills; if it has any value the request is almost certainly a bot.
 */
export function isHoneypotTripped(data: Record<string, any>, field = 'website'): boolean {
  const v = data?.[field];
  return typeof v === 'string' && v.trim().length > 0;
}

const RATE_STORE = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 5; // per window per key

/** Best-effort in-memory rate limit. Returns true when the caller is allowed. */
export function checkRateLimit(key: string, maxHits = MAX_HITS, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const hits = (RATE_STORE.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= maxHits) {
    RATE_STORE.set(key, hits);
    return false;
  }
  hits.push(now);
  RATE_STORE.set(key, hits);
  // opportunistic cleanup to bound memory
  if (RATE_STORE.size > 5000) {
    for (const [k, v] of RATE_STORE) {
      if (v.every((t) => now - t >= windowMs)) RATE_STORE.delete(k);
    }
  }
  return true;
}

/** Extract a best-effort client IP from request headers. */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
