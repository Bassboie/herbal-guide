import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Authoritative Server-Side Product Catalog
 * Prices and currencies are NEVER accepted from the client browser.
 */
export const PRODUCT_CATALOG = {
  'herbal-guide-pdf': {
    id: 'herbal-guide-pdf',
    name: 'Herbal Guide Digital PDF Handbook',
    priceNgn: 3000,
    amountInKobo: 300000, // ₦3,000 * 100
    currency: 'NGN',
    filename: 'Herbal_Guide_Traditional_Wellness_Handbook.pdf',
  },
} as const;

export type ProductId = keyof typeof PRODUCT_CATALOG;

export const PDF_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const ORDER_SESSION_COOKIE_NAME = 'hg_order_session';
export const ORDER_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_DOWNLOADS_PER_ORDER = 15;

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY_FUNCTION_RUNTIME === 'true' ||
      process.env.VERCEL_FUNCTION_RUNTIME === 'true' ||
      process.env.NETLIFY === 'true' ||
      process.env.VERCEL === '1' ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

// Ephemeral fallback secret for local dev only if env vars are unset
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');
let warnedMissingTokenSecret = false;

/**
 * Safely retrieves Paystack Secret Key strictly on the backend.
 * Rejects placeholder strings.
 */
export function getPaystackSecretKey(): string {
  const key = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  if (!key || key.includes('sample_key') || !key.startsWith('sk_')) {
    return '';
  }
  return key;
}

/**
 * Safely retrieves Paystack Public Key from server/build environment.
 * Rejects placeholder strings.
 */
export function getPaystackPublicKey(): string {
  const raw = (
    process.env.PAYSTACK_PUBLIC_KEY ||
    process.env.VITE_PAYSTACK_PUBLIC_KEY ||
    ''
  ).trim();
  if (!raw || raw.includes('sample_key') || !raw.startsWith('pk_')) {
    return '';
  }
  return raw;
}

/**
 * Retrieves dedicated HMAC signing key for short-lived download tokens and HttpOnly cookies.
 * Uses PDF_TOKEN_SECRET / SESSION_SECRET first; otherwise derives a domain-separated key.
 */
export function getSigningSecret(): string {
  const dedicated = (process.env.PDF_TOKEN_SECRET || process.env.SESSION_SECRET || '').trim();
  if (dedicated.length >= 32) {
    return dedicated;
  }

  const paystackSecret = getPaystackSecretKey();
  if (paystackSecret) {
    if (!warnedMissingTokenSecret && process.env.NODE_ENV === 'production') {
      warnedMissingTokenSecret = true;
      securityLog('warn', 'config_notice', {
        message: 'PDF_TOKEN_SECRET is not set; using HMAC-derived key. Set a dedicated 32+ char PDF_TOKEN_SECRET in Secrets.',
      });
    }
    return crypto
      .createHmac('sha256', paystackSecret)
      .update('herbal-guide-internal-token-signing-v1')
      .digest('hex');
  }

  return EPHEMERAL_FALLBACK_SECRET;
}

/**
 * Generates an unpredictable, cryptographically random Paystack transaction reference.
 */
export function generateSecureReference(): string {
  return `HG-${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Masks sensitive values (emails, references, IPs) before writing to logs.
 */
export function maskEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  const atIdx = clean.indexOf('@');
  if (atIdx <= 1) return '***';
  return `${clean[0]}***${clean.slice(atIdx)}`;
}

export function maskReference(ref: string): string {
  if (!ref || ref.length < 8) return '***';
  return `${ref.slice(0, 6)}...${ref.slice(-4)}`;
}

export function hashValue(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

/**
 * Structured, sanitized security logger (NEVER logs secret keys, card data, or full PII).
 */
export function securityLog(
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, string | number | boolean | undefined> = {}
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...details,
  };
  const serialized = JSON.stringify(entry);
  if (level === 'error') console.error(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.log(serialized);
}

/**
 * Input Validators & Sanitizers
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeText(input: unknown, maxLen = 120): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function validateEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function validatePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/[^\d+]/g, '');
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return null;
  }
  return cleaned;
}

export function validateProductId(input: unknown): ProductId | null {
  if (input === undefined || input === null || input === '') {
    return 'herbal-guide-pdf';
  }
  if (typeof input === 'string' && Object.prototype.hasOwnProperty.call(PRODUCT_CATALOG, input)) {
    return input as ProductId;
  }
  return null;
}

const REFERENCE_REGEX = /^[A-Za-z0-9_-]{8,80}$/;

export function validateReference(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!REFERENCE_REGEX.test(trimmed)) return null;
  // Block obvious test-bypass attempts when live or general traversal strings
  if (trimmed.includes('..') || trimmed.includes('/')) return null;
  return trimmed;
}

export const PAYSTACK_SUPPORTED_CHANNELS = [
  'card',
  'bank_transfer',
  'ussd',
  'bank',
  'mobile_money',
  'qr',
  'apple_pay',
  'google_pay',
  'eft',
] as const;

export type PaystackChannel = (typeof PAYSTACK_SUPPORTED_CHANNELS)[number];

/**
 * Validates optional Paystack payment channels array.
 * Returns undefined when "all active account channels" should be shown.
 */
export function validatePaystackChannels(input: unknown): PaystackChannel[] | undefined {
  if (!Array.isArray(input) || input.length === 0) {
    return undefined;
  }

  const allowedSet = new Set<string>(PAYSTACK_SUPPORTED_CHANNELS);
  const filtered: PaystackChannel[] = [];
  for (const item of input) {
    if (typeof item === 'string') {
      const normalized = item.trim().toLowerCase();
      if (allowedSet.has(normalized) && !filtered.includes(normalized as PaystackChannel)) {
        filtered.push(normalized as PaystackChannel);
      }
    }
  }

  if (filtered.length === 0) {
    return undefined;
  }

  // Paystack Inline requires 'card' alongside wallet-only channels as fallback
  if (
    (filtered.includes('google_pay') || filtered.includes('apple_pay')) &&
    !filtered.includes('card')
  ) {
    filtered.unshift('card');
  }

  return filtered;
}

/**
 * Constant-time verification of Paystack Webhook HMAC-SHA512 signature over raw request bytes.
 */
export function verifyPaystackWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secretKey: string
): boolean {
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) return false;
  if (!signatureHeader || typeof signatureHeader !== 'string') return false;
  if (!secretKey) return false;

  const normalizedProvided = signatureHeader.trim().toLowerCase();
  if (!/^[a-f0-9]{128}$/.test(normalizedProvided)) {
    return false;
  }

  const expectedHex = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')
    .toLowerCase();

  const expectedBuf = Buffer.from(expectedHex, 'utf8');
  const providedBuf = Buffer.from(normalizedProvided, 'utf8');

  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Signed, Expiring PDF Download Token (HMAC-SHA256)
 */
export interface DownloadTokenPayload {
  ref: string;
  eh: string; // sha256 of lowercase customer email
  pid: ProductId;
  iat: number;
  exp: number;
  jti: string;
}

export function createSignedDownloadToken(params: {
  reference: string;
  email: string;
  productId: ProductId;
  ttlMs?: number;
}): { token: string; expiresAt: number; jti: string } {
  const now = Date.now();
  const ttl = params.ttlMs ?? PDF_TOKEN_TTL_MS;
  const jti = crypto.randomBytes(10).toString('hex');

  const payload: DownloadTokenPayload = {
    ref: params.reference,
    eh: hashValue(params.email.trim().toLowerCase()),
    pid: params.productId,
    iat: now,
    exp: now + ttl,
    jti,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${payloadB64}.${sigB64}`,
    expiresAt: payload.exp,
    jti,
  };
}

export function verifySignedDownloadToken(token: unknown): DownloadTokenPayload | null {
  if (typeof token !== 'string' || token.length < 20 || token.length > 1024) {
    return null;
  }

  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0 || dotIdx === token.length - 1) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);

  const expectedSigB64 = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  const expectedBuf = Buffer.from(expectedSigB64, 'utf8');
  const providedBuf = Buffer.from(sigB64, 'utf8');

  if (expectedBuf.length !== providedBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as DownloadTokenPayload;
    if (
      !decoded ||
      typeof decoded.ref !== 'string' ||
      typeof decoded.eh !== 'string' ||
      typeof decoded.exp !== 'number' ||
      !Object.prototype.hasOwnProperty.call(PRODUCT_CATALOG, decoded.pid)
    ) {
      return null;
    }

    if (Date.now() > decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Signed HttpOnly Order Session Cookie (prevents IDOR when verifying order & issuing download tokens)
 */
interface OrderSessionPayload {
  refs: string[]; // supports up to last 5 references initiated in this browser session
  eh: string;
  exp: number;
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      if (key) {
        try {
          result[key] = decodeURIComponent(val);
        } catch {
          result[key] = val;
        }
      }
    }
  }
  return result;
}

export function createOrderSessionCookie(
  existingCookieVal: string | undefined,
  reference: string,
  email: string
): string {
  const existing = verifyOrderSessionCookie(existingCookieVal);
  const refs = existing ? existing.refs.filter((r) => r !== reference) : [];
  refs.unshift(reference);

  const payload: OrderSessionPayload = {
    refs: refs.slice(0, 5),
    eh: hashValue(email.trim().toLowerCase()),
    exp: Date.now() + ORDER_SESSION_TTL_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', getSigningSecret())
    .update(`session:${payloadB64}`)
    .digest('base64url');

  return `${payloadB64}.${sigB64}`;
}

export function verifyOrderSessionCookie(cookieVal: string | undefined): OrderSessionPayload | null {
  if (!cookieVal || typeof cookieVal !== 'string') return null;
  const dotIdx = cookieVal.indexOf('.');
  if (dotIdx <= 0 || dotIdx === cookieVal.length - 1) return null;

  const payloadB64 = cookieVal.slice(0, dotIdx);
  const sigB64 = cookieVal.slice(dotIdx + 1);

  const expectedSigB64 = crypto
    .createHmac('sha256', getSigningSecret())
    .update(`session:${payloadB64}`)
    .digest('base64url');

  const expectedBuf = Buffer.from(expectedSigB64, 'utf8');
  const providedBuf = Buffer.from(sigB64, 'utf8');
  if (expectedBuf.length !== providedBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as OrderSessionPayload;
    if (!decoded || !Array.isArray(decoded.refs) || typeof decoded.exp !== 'number') {
      return null;
    }
    if (Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function setSecureOrderSessionCookie(
  req: Request,
  res: Response,
  reference: string,
  email: string
): void {
  const existing = parseCookies(req.headers.cookie)[ORDER_SESSION_COOKIE_NAME];
  const value = createOrderSessionCookie(existing, reference, email);
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

  res.cookie(ORDER_SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: ORDER_SESSION_TTL_MS,
  });
}

/**
 * Sliding-window Rate Limiter Middleware
 */
interface RateLimitBucket {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  const store = new Map<string, RateLimitBucket>();

  // Periodic cleanup every 5 minutes to prevent unbounded memory growth
  const cleanupTimer = setInterval(() => {
    const cutoff = Date.now() - options.windowMs;
    for (const [key, bucket] of store.entries()) {
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
      if (bucket.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.ip || req.socket.remoteAddress || 'unknown').trim();
    const bucketKey = `${options.keyPrefix}:${clientIp}`;
    const now = Date.now();
    const cutoff = now - options.windowMs;

    const bucket = store.get(bucketKey) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

    if (bucket.timestamps.length >= options.max) {
      const oldest = bucket.timestamps[0] || now;
      const retryAfterSec = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      securityLog('warn', 'rate_limit_exceeded', {
        limiter: options.keyPrefix,
        ipHash: hashValue(clientIp).slice(0, 12),
      });
      return res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please wait a moment and try again.',
      });
    }

    bucket.timestamps.push(now);
    store.set(bucketKey, bucket);
    return next();
  };
}

/**
 * Strict Origin / Callback Allowlist Helpers
 */
function normalizeOriginCandidate(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9.-]+(:\d+)?$/.test(trimmed)) return `https://${trimmed}`;
  return '';
}

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const candidates = [
    process.env.APP_URL || '',
    process.env.URL || '',
    process.env.DEPLOY_PRIME_URL || '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
    process.env.VERCEL_BRANCH_URL || '',
    process.env.VERCEL_URL || '',
    ...(process.env.ALLOWED_ORIGINS || '').split(','),
  ];

  for (const raw of candidates) {
    const normalized = normalizeOriginCandidate(raw);
    if (normalized && /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(normalized)) {
      origins.add(normalized);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  return Array.from(origins);
}

/**
 * Resolves a safe, non-spoofable callback base URL (prevents Origin Header Injection / Open Redirect).
 */
export function getSafeAppBaseUrl(req: Request): string {
  const configuredAppUrl = normalizeOriginCandidate(
    process.env.APP_URL ||
      process.env.URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      ''
  );
  if (configuredAppUrl && /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(configuredAppUrl)) {
    return configuredAppUrl;
  }

  // Behind Nginx/Cloud Run/Netlify/Vercel, proxy sets the real host in X-Forwarded-Host
  const forwardedHostRaw = req.get('x-forwarded-host') || '';
  const forwardedHost = forwardedHostRaw.split(',')[0].trim();
  if (forwardedHost && /^[a-zA-Z0-9.-]+(:\d+)?$/.test(forwardedHost)) {
    const proto = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    return `${proto}://${forwardedHost}`;
  }

  // Fallback only to validated Host header (never req.headers.origin)
  const host = (req.get('host') || '').trim();
  if (/^[a-zA-Z0-9.-]+(:\d+)?$/.test(host)) {
    const proto = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}
