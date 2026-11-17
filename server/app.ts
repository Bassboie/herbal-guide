import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  MAX_DOWNLOADS_PER_ORDER,
  ORDER_SESSION_COOKIE_NAME,
  PAYSTACK_SUPPORTED_CHANNELS,
  PRODUCT_CATALOG,
  createRateLimiter,
  createSignedDownloadToken,
  generateSecureReference,
  getAllowedOrigins,
  getPaystackPublicKey,
  getPaystackSecretKey,
  getSafeAppBaseUrl,
  hashValue,
  isServerlessRuntime,
  maskEmail,
  maskReference,
  parseCookies,
  sanitizeText,
  securityLog,
  setSecureOrderSessionCookie,
  validateEmail,
  validatePaystackChannels,
  validatePhone,
  validateProductId,
  validateReference,
  verifyOrderSessionCookie,
  verifyPaystackWebhookSignature,
  verifySignedDownloadToken,
} from './security.ts';
import {
  claimWebhookEvent,
  createPendingOrder,
  getOrderByReference,
  getSupabaseAdminClient,
  isPersistentStoreRequired,
  isSupabaseConfigured,
  markOrderCompletedIdempotent,
  recordDownloadAttempt,
} from './store.ts';
import {
  ensureDefaultPrivateHandbookPdf,
  fetchVerifiedUpstreamPdf,
  generateHerbalGuidePdfBuffer,
} from './pdfBuilder.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAYSTACK_API_BASE = 'https://api.paystack.co';

// Server-only upstream source (never exposed to browser; fetched strictly after Paystack verification)
const DEFAULT_DRIVE_PDF_SOURCE_URL =
  'https://drive.google.com/file/d/11tgwyBiPe_8nV0EwMismJrCTCjdb8244/view?usp=drivesdk';

export function resolveDefaultPrivatePdfPath(): string {
  const cwdPath = path.resolve(process.cwd(), 'private_assets/herbal-guide-handbook.pdf');
  if (fs.existsSync(cwdPath)) return cwdPath;
  return path.resolve(__dirname, '../private_assets/herbal-guide-handbook.pdf');
}

// -----------------------------------------------------------------------------
// Optional Post-Verification Email Delivery (Short-Lived Signed Link Only)
// -----------------------------------------------------------------------------
async function sendVerifiedPdfEmail(params: {
  toEmail: string;
  customerName: string;
  reference: string;
  downloadToken: string;
  baseUrl: string;
}): Promise<void> {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const emailFrom = (process.env.EMAIL_FROM || '').trim();
  if (!resendApiKey || !emailFrom) return;

  const downloadUrl = `${params.baseUrl}/api/pdf/download?token=${encodeURIComponent(params.downloadToken)}`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [params.toEmail],
        subject: 'Your Herbal Guide PDF Handbook – Verified Receipt & Download Link',
        html: `
          <p>Hello ${sanitizeText(params.customerName, 80)},</p>
          <p>Your Paystack payment for <strong>Herbal Guide Digital PDF Handbook</strong> (Ref: <code>${sanitizeText(params.reference, 64)}</code>) has been verified.</p>
          <p><a href="${downloadUrl}">Download Your PDF Handbook</a> (this secure link expires in 30 minutes).</p>
          <p>Need help? Reply to aladesunloyeemmanuel@gmail.com.</p>
        `,
      }),
    });

    if (!resp.ok) {
      securityLog('warn', 'email_delivery_failed', {
        ref: maskReference(params.reference),
        status: resp.status,
      });
    } else {
      securityLog('info', 'email_delivery_sent', {
        ref: maskReference(params.reference),
        email: maskEmail(params.toEmail),
      });
    }
  } catch {
    securityLog('warn', 'email_delivery_exception', {
      ref: maskReference(params.reference),
    });
  }
}

async function processWebhookEvent(event: any, baseUrl: string): Promise<void> {
  try {
    if (!event || event.event !== 'charge.success' || !event.data) {
      return;
    }

    const tx = event.data;
    const reference = validateReference(tx.reference);
    if (!reference) {
      securityLog('warn', 'webhook_invalid_reference');
      return;
    }

    const product = PRODUCT_CATALOG['herbal-guide-pdf'];
    if (
      tx.status !== 'success' ||
      Number(tx.amount) !== product.amountInKobo ||
      String(tx.currency || '').toUpperCase() !== product.currency
    ) {
      securityLog('warn', 'webhook_amount_or_status_mismatch', {
        ref: maskReference(reference),
        status: String(tx.status || ''),
        amount: Number(tx.amount) || 0,
      });
      return;
    }

    const eventKey = `charge.success:${reference}`;
    const claimed = await claimWebhookEvent(
      eventKey,
      'charge.success',
      reference,
      tx.id ? String(tx.id) : undefined
    );

    if (!claimed) {
      securityLog('info', 'webhook_duplicate_ignored', {
        ref: maskReference(reference),
      });
      return;
    }

    // Cross-check with existing order if initialized on server
    const existingOrder = await getOrderByReference(reference);
    const customerEmail =
      validateEmail(tx.customer?.email) ||
      existingOrder?.customerEmail ||
      '';
    if (!customerEmail) {
      securityLog('warn', 'webhook_missing_email', { ref: maskReference(reference) });
      return;
    }

    const customerName = sanitizeText(
      tx.metadata?.customer_name || existingOrder?.customerName || 'Verified Reader',
      100
    );

    const { order, newlyCompleted } = await markOrderCompletedIdempotent({
      reference,
      productId: existingOrder?.productId || product.id,
      customerName,
      customerEmail,
      amountNgn: product.priceNgn,
      amountKobo: product.amountInKobo,
      paystackTransactionId: tx.id ? String(tx.id) : undefined,
      channel: sanitizeText(tx.channel || 'card', 32),
      paidAt: tx.paid_at || tx.created_at || new Date().toISOString(),
    });

    if (newlyCompleted) {
      const { token } = createSignedDownloadToken({
        reference: order.reference,
        email: order.customerEmail,
        productId: order.productId,
      });
      await sendVerifiedPdfEmail({
        toEmail: order.customerEmail,
        customerName: order.customerName,
        reference: order.reference,
        downloadToken: token,
        baseUrl,
      });
    }
  } catch {
    securityLog('error', 'webhook_async_processing_failed');
  }
}

export function createApp(): express.Express {
  const app = express();

  // Trust reverse proxy (Netlify / Cloud Run / Nginx) for accurate req.ip and x-forwarded-proto
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // -----------------------------------------------------------------------------
  // 1. HTTPS Enforcement & Security Headers Middleware
  // -----------------------------------------------------------------------------
  app.use((req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const forwardedHost = (req.get('x-forwarded-host') || '').split(',')[0].trim();
    const effectiveHost = forwardedHost || req.get('host') || '';
    const isLocalHost =
      effectiveHost.startsWith('localhost') || effectiveHost.startsWith('127.0.0.1');

    if (
      isProduction &&
      !isServerlessRuntime() &&
      !isLocalHost &&
      req.headers['x-forwarded-proto'] === 'http' &&
      /^[a-zA-Z0-9.-]+(:\d+)?$/.test(effectiveHost)
    ) {
      return res.redirect(301, `https://${effectiveHost}${req.originalUrl}`);
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-XSS-Protection', '0');

    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    if (isProduction) {
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://js.paystack.co https://pay.google.com https://applepay.cdn-apple.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paystack.com https://*.paystack.co",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.paystack.co https://*.paystack.com https://pay.google.com",
          "frame-src 'self' https://*.paystack.com https://*.paystack.co https://pay.google.com",
          "frame-ancestors 'self' https://*.google.com https://*.ai.studio https://*.googleusercontent.com",
          "base-uri 'self'",
          "form-action 'self' https://*.paystack.com https://*.paystack.co",
        ].join('; ')
      );
    }

    return next();
  });

  // Block direct HTTP access to private server files & private PDF storage
  app.use((req, res, next) => {
    const reqPath = (req.path || '').toLowerCase();
    if (
      reqPath === '/private_assets' ||
      reqPath.startsWith('/private_assets/') ||
      reqPath === '/server' ||
      reqPath.startsWith('/server/') ||
      reqPath.startsWith('/.env') ||
      reqPath === '/supabase_schema.sql' ||
      reqPath === '/server.ts'
    ) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  });

  // -----------------------------------------------------------------------------
  // 2. Strict CORS Policy for /api/* (excluding server-to-server webhook & health)
  // -----------------------------------------------------------------------------
  app.use('/api', (req, res, next) => {
    if (req.path === '/paystack/webhook' || req.path === '/health') {
      return next();
    }

    const origin = req.headers.origin;
    if (!origin) {
      return next();
    }

    const allowed = getAllowedOrigins();
    const host = req.get('host') || '';
    const forwardedHost = (req.get('x-forwarded-host') || '').split(',')[0].trim();

    const sameHostOrigins = [
      host ? `https://${host}` : '',
      host ? `http://${host}` : '',
      forwardedHost ? `https://${forwardedHost}` : '',
      forwardedHost ? `http://${forwardedHost}` : '',
    ].filter(Boolean);

    const isAllowed = allowed.includes(origin) || sameHostOrigins.includes(origin);

    if (!isAllowed) {
      securityLog('warn', 'cors_blocked', {
        origin: sanitizeText(origin, 100),
        path: req.path,
      });
      return res.status(403).json({ success: false, message: 'Origin not permitted' });
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });

  // -----------------------------------------------------------------------------
  // 3. Rate Limiters
  // -----------------------------------------------------------------------------
  const initLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 12,
    keyPrefix: 'paystack_init',
    message: 'Too many checkout attempts. Please wait a few minutes and try again.',
  });

  const verifyLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    keyPrefix: 'paystack_verify',
    message: 'Too many verification attempts. Please wait a moment.',
  });

  const downloadLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyPrefix: 'pdf_download',
    message: 'Too many download requests. Please wait a few minutes.',
  });

  const webhookLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    keyPrefix: 'paystack_webhook',
  });

  // -----------------------------------------------------------------------------
  // 4. Paystack Webhook Endpoint (MUST stay before express.json() for RAW body!)
  // -----------------------------------------------------------------------------
  app.all('/api/paystack/webhook', webhookLimiter, (req, res, next) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    return next();
  });

  app.post(
    '/api/paystack/webhook',
    express.raw({ type: '*/*', limit: '256kb' }),
    async (req, res) => {
      const secretKey = getPaystackSecretKey();
      if (!secretKey) {
        securityLog('error', 'webhook_missing_secret_key');
        return res.status(503).json({ success: false, message: 'Webhook verification unavailable' });
      }

      if (isPersistentStoreRequired() && !isSupabaseConfigured()) {
        securityLog('error', 'webhook_missing_persistent_db');
        return res.status(503).json({ success: false, message: 'Database persistence unavailable' });
      }

      const reqAny = req as any;
      const rawBody = Buffer.isBuffer(reqAny.rawBody)
        ? reqAny.rawBody
        : Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === 'string'
        ? Buffer.from(req.body, 'utf8')
        : Buffer.alloc(0);

      const signature = req.headers['x-paystack-signature'];
      const sigStr = Array.isArray(signature) ? signature[0] : signature;

      // Constant-time HMAC-SHA512 verification over raw request bytes
      if (!verifyPaystackWebhookSignature(rawBody, sigStr, secretKey)) {
        securityLog('warn', 'webhook_signature_invalid', {
          ipHash: hashValue(req.ip || 'unknown').slice(0, 12),
        });
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      let event: any;
      try {
        event = JSON.parse(rawBody.toString('utf8'));
      } catch {
        securityLog('warn', 'webhook_invalid_json');
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
      }

      const baseUrl = getSafeAppBaseUrl(req);

      if (isServerlessRuntime()) {
        // Serverless runtimes freeze execution immediately after returning response
        await processWebhookEvent(event, baseUrl);
        return res.status(200).json({ received: true });
      }

      // Acknowledge receipt fast with 200 OK; fulfill asynchronously in persistent Node
      res.status(200).json({ received: true });
      setImmediate(() => {
        void processWebhookEvent(event, baseUrl);
      });
    }
  );

  // Standard JSON body parser for all other API endpoints (after webhook raw route)
  app.use(express.json({ limit: '32kb' }));

  // -----------------------------------------------------------------------------
  // 5. Initialize Paystack Transaction (Server-Authoritative Pricing & Reference)
  // -----------------------------------------------------------------------------
  app.post('/api/paystack/initialize', initLimiter, async (req, res) => {
    try {
      const body = req.body || {};

      // Honeypot check to block simple automated bots
      if (body.website || body.company) {
        securityLog('warn', 'honeypot_triggered', {
          ipHash: hashValue(req.ip || 'unknown').slice(0, 12),
        });
        return res.status(400).json({ success: false, message: 'Invalid submission.' });
      }

      if (isPersistentStoreRequired() && !isSupabaseConfigured()) {
        securityLog('error', 'initialize_missing_persistent_db');
        return res.status(503).json({
          success: false,
          message: 'Payment service configuration is incomplete (persistent database not configured). Please contact support.',
        });
      }

      const email = validateEmail(body.email);
      if (!email) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }

      const fullName = sanitizeText(body.fullName, 100);
      if (fullName.length < 2) {
        return res.status(400).json({ success: false, message: 'Please enter your full name.' });
      }

      const phone = validatePhone(body.phone);
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Please enter a valid mobile phone number.' });
      }

      const productId = validateProductId(body.productId);
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Invalid product selected.' });
      }

      const product = PRODUCT_CATALOG[productId];

      // Reject client price/currency tampering explicitly
      if (body.amount !== undefined && Number(body.amount) !== product.priceNgn) {
        securityLog('warn', 'price_tamper_attempt', {
          email: maskEmail(email),
          attemptedAmount: Number(body.amount) || 0,
        });
        return res.status(400).json({ success: false, message: 'Invalid product amount.' });
      }
      if (body.currency !== undefined && String(body.currency).toUpperCase() !== product.currency) {
        return res.status(400).json({ success: false, message: 'Invalid currency.' });
      }

      const paystackSecretKey = getPaystackSecretKey();
      const paystackPublicKey = getPaystackPublicKey();
      if (!paystackSecretKey || !paystackPublicKey) {
        securityLog('error', 'initialize_missing_paystack_keys');
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured yet. Please contact support.',
        });
      }

      if (paystackSecretKey.startsWith('sk_live_') !== paystackPublicKey.startsWith('pk_live_')) {
        securityLog('error', 'initialize_paystack_key_mode_mismatch');
        return res.status(503).json({
          success: false,
          message: 'Payment gateway key configuration mismatch. Please contact support.',
        });
      }

      // Generate cryptographically random reference & store expected order BEFORE payment
      const reference = generateSecureReference();
      const baseUrl = getSafeAppBaseUrl(req);
      const callbackUrl = `${baseUrl}/payment-success`;

      await createPendingOrder({
        reference,
        productId: product.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        expectedAmountKobo: product.amountInKobo,
        expectedAmountNgn: product.priceNgn,
        currency: product.currency,
      });

      const requestedChannels = validatePaystackChannels(body.channels);

      const payload: Record<string, any> = {
        email,
        amount: product.amountInKobo,
        currency: product.currency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          product_id: product.id,
          product: product.name,
          customer_name: fullName,
          phone_number: phone,
          expected_amount_ngn: product.priceNgn,
          requested_channels: requestedChannels ? requestedChannels.join(',') : 'all_active',
          author: 'Prince Emmanuel',
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: fullName,
            },
            {
              display_name: 'Mobile Phone',
              variable_name: 'phone_number',
              value: phone,
            },
            {
              display_name: 'Product',
              variable_name: 'product_name',
              value: product.name,
            },
          ],
        },
      };

      if (requestedChannels && requestedChannels.length > 0) {
        payload.channels = requestedChannels;
      }

      const callPaystackInit = async (initPayload: Record<string, any>) => {
        const resp = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initPayload),
        });
        const json: any = await resp.json();
        return { resp, json };
      };

      let { resp: response, json: data } = await callPaystackInit(payload);
      let channelFallback = false;

      if ((!response.ok || !data?.status || !data?.data?.access_code) && payload.channels) {
        securityLog('warn', 'paystack_channel_fallback_to_all', {
          ref: maskReference(reference),
          requested: requestedChannels?.join(',') || '',
          httpStatus: response.status,
        });
        const fallbackPayload = { ...payload };
        delete fallbackPayload.channels;
        const retry = await callPaystackInit(fallbackPayload);
        response = retry.resp;
        data = retry.json;
        channelFallback = true;
      }

      if (!response.ok || !data?.status || !data?.data?.access_code) {
        securityLog('error', 'paystack_initialize_failed', {
          ref: maskReference(reference),
          httpStatus: response.status,
        });
        return res.status(502).json({
          success: false,
          message: 'Unable to start Paystack checkout right now. Please try again.',
        });
      }

      // Bind browser session to this transaction reference via HttpOnly signed cookie
      setSecureOrderSessionCookie(req, res, reference, email);

      securityLog('info', 'paystack_initialized', {
        ref: maskReference(reference),
        email: maskEmail(email),
        amountNgn: product.priceNgn,
        channelFallback,
      });

      return res.json({
        success: true,
        access_code: data.data.access_code,
        reference: data.data.reference,
        authorization_url: data.data.authorization_url,
        channelFallback,
      });
    } catch {
      securityLog('error', 'paystack_initialize_exception');
      return res.status(500).json({
        success: false,
        message: 'Unable to initialize payment right now. Please try again.',
      });
    }
  });

  // -----------------------------------------------------------------------------
  // 6. Server-Side Transaction Verification (Strict Amount/Currency/Ownership)
  // -----------------------------------------------------------------------------
  async function handleVerifyTransaction(req: express.Request, res: express.Response) {
    try {
      const rawRef = req.params.reference || req.body?.reference;
      const reference = validateReference(rawRef);

      if (!reference) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Invalid transaction reference format.',
        });
      }

      if (isPersistentStoreRequired() && !isSupabaseConfigured()) {
        securityLog('error', 'verify_missing_persistent_db');
        return res.status(503).json({
          success: false,
          verified: false,
          message: 'Verification service configuration is incomplete. Please contact support.',
        });
      }

      const paystackSecretKey = getPaystackSecretKey();
      if (!paystackSecretKey) {
        securityLog('error', 'verify_missing_secret_key');
        return res.status(503).json({
          success: false,
          verified: false,
          message: 'Verification service is temporarily unavailable.',
        });
      }

      const response = await fetch(
        `${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: any = await response.json();

      if (!response.ok || !data?.status || !data?.data) {
        securityLog('warn', 'paystack_verify_api_rejected', {
          ref: maskReference(reference),
          httpStatus: response.status,
        });
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'We could not verify this transaction with Paystack.',
        });
      }

      const tx = data.data;
      const product = PRODUCT_CATALOG['herbal-guide-pdf'];
      const existingOrder = await getOrderByReference(reference);

      const expectedAmountKobo = existingOrder
        ? existingOrder.expectedAmountKobo
        : product.amountInKobo;
      const expectedCurrency = existingOrder ? existingOrder.currency : product.currency;

      const txEmail = validateEmail(tx.customer?.email) || existingOrder?.customerEmail || '';

      const normalizedStatus = String(tx.status || 'pending').toLowerCase();
      if (normalizedStatus !== 'success') {
        const isPending = ['pending', 'ongoing', 'processing', 'queued'].includes(normalizedStatus);
        return res.json({
          success: true,
          verified: false,
          pending: isPending,
          message: isPending
            ? 'Your payment (Bank Transfer / USSD / Bank) is still confirming with Paystack. Please wait a few seconds and click Verify Payment Again.'
            : 'Payment has not been completed yet.',
          data: {
            reference,
            status: sanitizeText(normalizedStatus, 30),
            amount: product.priceNgn,
            currency: expectedCurrency,
            channel: sanitizeText(String(tx.channel || ''), 32),
          },
        });
      }

      if (
        tx.reference !== reference ||
        Number(tx.amount) !== expectedAmountKobo ||
        String(tx.currency || '').toUpperCase() !== expectedCurrency
      ) {
        securityLog('warn', 'verify_integrity_mismatch', {
          ref: maskReference(reference),
          txAmount: Number(tx.amount) || 0,
          expectedAmountKobo,
          txCurrency: sanitizeText(String(tx.currency || ''), 10),
        });
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Transaction amount or currency did not match the product price.',
        });
      }

      if (existingOrder?.customerEmail && txEmail && existingOrder.customerEmail !== txEmail) {
        securityLog('warn', 'verify_email_mismatch', {
          ref: maskReference(reference),
        });
        return res.status(403).json({
          success: false,
          verified: false,
          message: 'Transaction customer mismatch.',
        });
      }

      const customerName = sanitizeText(
        tx.metadata?.customer_name || existingOrder?.customerName || 'Verified Reader',
        100
      );

      const { order } = await markOrderCompletedIdempotent({
        reference,
        productId: existingOrder?.productId || product.id,
        customerName,
        customerEmail: txEmail || 'reader@verified.local',
        amountNgn: product.priceNgn,
        amountKobo: expectedAmountKobo,
        paystackTransactionId: tx.id ? String(tx.id) : undefined,
        channel: sanitizeText(tx.channel || 'card', 32),
        paidAt: tx.paid_at || tx.created_at || new Date().toISOString(),
      });

      const cookies = parseCookies(req.headers.cookie);
      const session = verifyOrderSessionCookie(cookies[ORDER_SESSION_COOKIE_NAME]);
      const hasSessionOwnership = Boolean(session && session.refs.includes(reference));

      const suppliedEmail = validateEmail(req.query.email || req.body?.email);
      const hasEmailOwnership = Boolean(
        suppliedEmail &&
          order.customerEmail &&
          suppliedEmail === order.customerEmail
      );

      if (!hasSessionOwnership && !hasEmailOwnership) {
        return res.json({
          success: true,
          verified: true,
          requiresEmailConfirmation: true,
          message: 'Please confirm your checkout email address to unlock your PDF download.',
          data: {
            reference: order.reference,
            status: order.status,
            amount: order.expectedAmountNgn,
            currency: order.currency,
            paidAt: order.paidAt || new Date().toISOString(),
          },
        });
      }

      if (!hasSessionOwnership && hasEmailOwnership) {
        setSecureOrderSessionCookie(req, res, order.reference, order.customerEmail);
      }

      const { token: downloadToken, expiresAt: downloadExpiresAt } = createSignedDownloadToken({
        reference: order.reference,
        email: order.customerEmail,
        productId: order.productId,
      });

      return res.json({
        success: true,
        verified: true,
        requiresEmailConfirmation: false,
        downloadToken,
        downloadExpiresAt,
        data: {
          reference: order.reference,
          status: order.status,
          amount: order.expectedAmountNgn,
          currency: order.currency,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          paidAt: order.paidAt || new Date().toISOString(),
          channel: order.channel,
        },
      });
    } catch {
      securityLog('error', 'paystack_verify_exception');
      return res.status(500).json({
        success: false,
        verified: false,
        message: 'Unable to verify payment right now. Please try again.',
      });
    }
  }

  app.get('/api/paystack/verify/:reference', verifyLimiter, handleVerifyTransaction);
  app.post('/api/paystack/verify', verifyLimiter, handleVerifyTransaction);

  // -----------------------------------------------------------------------------
  // 7. Authenticated, Short-Lived, Rate-Limited PDF Streaming Endpoint
  // -----------------------------------------------------------------------------
  app.get('/api/pdf/download', downloadLimiter, async (req, res) => {
    try {
      const tokenPayload = verifySignedDownloadToken(req.query.token);
      if (!tokenPayload) {
        securityLog('warn', 'pdf_download_invalid_or_expired_token', {
          ipHash: hashValue(req.ip || 'unknown').slice(0, 12),
        });
        return res.status(403).json({
          success: false,
          message: 'Your download link is invalid or has expired. Please re-verify your payment reference.',
        });
      }

      const order = await getOrderByReference(tokenPayload.ref);
      const product = PRODUCT_CATALOG[tokenPayload.pid];

      if (
        !order ||
        order.status !== 'completed' ||
        order.expectedAmountKobo !== product.amountInKobo ||
        order.currency !== product.currency ||
        hashValue(order.customerEmail.toLowerCase()) !== tokenPayload.eh
      ) {
        securityLog('warn', 'pdf_download_order_check_failed', {
          ref: maskReference(tokenPayload.ref),
        });
        return res.status(403).json({
          success: false,
          message: 'Unauthorized download request.',
        });
      }

      if (order.downloadCount >= MAX_DOWNLOADS_PER_ORDER) {
        securityLog('warn', 'pdf_download_limit_reached', {
          ref: maskReference(order.reference),
          count: order.downloadCount,
        });
        return res.status(429).json({
          success: false,
          message: 'Maximum download limit reached for this order. Please contact support for assistance.',
        });
      }

      const disposition = req.query.disposition === 'inline' ? 'inline' : 'attachment';

      const setPdfHeaders = () => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `${disposition}; filename="${product.filename}"`
        );
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      };

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = sanitizeText(req.headers['user-agent'] || 'Unknown', 250);

      // Source 1: Private local file path (strictly outside dist/ and public/)
      const privatePdfPathEnv = (process.env.PRIVATE_PDF_PATH || '').trim();
      if (privatePdfPathEnv) {
        const resolvedPath = path.resolve(process.cwd(), privatePdfPathEnv);
        const distDir = path.resolve(process.cwd(), 'dist');
        const publicDir = path.resolve(process.cwd(), 'public');
        if (
          resolvedPath.startsWith(distDir) ||
          resolvedPath.startsWith(publicDir) ||
          !resolvedPath.toLowerCase().endsWith('.pdf') ||
          !fs.existsSync(resolvedPath)
        ) {
          securityLog('error', 'pdf_private_path_misconfigured');
          return res.status(503).json({
            success: false,
            message: 'PDF file is temporarily unavailable. Please contact support.',
          });
        }

        await recordDownloadAttempt({
          reference: order.reference,
          customerEmail: order.customerEmail,
          tokenJti: tokenPayload.jti,
          clientIp,
          userAgent,
        });

        setPdfHeaders();
        const stream = fs.createReadStream(resolvedPath);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to stream PDF.' });
          }
        });
        return stream.pipe(res);
      }

      // Source 2: Private Supabase Storage Bucket (via service role)
      const sbBucket = (process.env.SUPABASE_PDF_BUCKET || '').trim();
      const sbObjectPath = (process.env.SUPABASE_PDF_PATH || '').trim();
      const sbAdmin = getSupabaseAdminClient();
      if (sbAdmin && sbBucket && sbObjectPath) {
        const { data: blobData, error } = await sbAdmin.storage
          .from(sbBucket)
          .download(sbObjectPath);

        if (error || !blobData) {
          securityLog('error', 'pdf_supabase_download_failed');
          return res.status(503).json({
            success: false,
            message: 'PDF storage is temporarily unavailable. Please contact support.',
          });
        }

        await recordDownloadAttempt({
          reference: order.reference,
          customerEmail: order.customerEmail,
          tokenJti: tokenPayload.jti,
          clientIp,
          userAgent,
        });

        const arrayBuffer = await blobData.arrayBuffer();
        setPdfHeaders();
        return res.send(Buffer.from(arrayBuffer));
      }

      // Source 3: Private Server-Only Upstream URL / Google Drive Delivery (never exposed before payment)
      const pdfSourceUrl = (process.env.PDF_SOURCE_URL || DEFAULT_DRIVE_PDF_SOURCE_URL).trim();
      if (pdfSourceUrl && /^https:\/\//i.test(pdfSourceUrl)) {
        const upstreamResult = await fetchVerifiedUpstreamPdf(pdfSourceUrl);
        if ('buffer' in upstreamResult) {
          await recordDownloadAttempt({
            reference: order.reference,
            customerEmail: order.customerEmail,
            tokenJti: tokenPayload.jti,
            clientIp,
            userAgent,
          });

          setPdfHeaders();
          return res.send(upstreamResult.buffer);
        }

        const driveIdMatch =
          pdfSourceUrl.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/) ||
          pdfSourceUrl.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
        if (driveIdMatch?.[1]) {
          const driveId = driveIdMatch[1];
          const targetDriveUrl =
            disposition === 'inline'
              ? `https://drive.google.com/file/d/${driveId}/view?usp=drivesdk`
              : `https://drive.google.com/uc?export=download&id=${driveId}`;

          await recordDownloadAttempt({
            reference: order.reference,
            customerEmail: order.customerEmail,
            tokenJti: tokenPayload.jti,
            clientIp,
            userAgent,
          });

          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          res.setHeader('Pragma', 'no-cache');
          return res.redirect(302, targetDriveUrl);
        }

        securityLog('warn', 'pdf_upstream_fallback_to_builtin', {
          reason: upstreamResult.errorReason,
          status: upstreamResult.status || 0,
        });
      }

      // Source 4: Built-in Private Server Storage / In-Memory PDF Generator
      const defaultPrivatePath = resolveDefaultPrivatePdfPath();
      const distDir = path.resolve(process.cwd(), 'dist');
      const publicDir = path.resolve(process.cwd(), 'public');
      let fallbackPdfPath = defaultPrivatePath;
      let diskAvailable = false;

      try {
        if (!fs.existsSync(defaultPrivatePath)) {
          fallbackPdfPath = ensureDefaultPrivateHandbookPdf(defaultPrivatePath);
        }
        diskAvailable =
          !fallbackPdfPath.startsWith(distDir) &&
          !fallbackPdfPath.startsWith(publicDir) &&
          fs.existsSync(fallbackPdfPath);
      } catch {
        diskAvailable = false;
      }

      await recordDownloadAttempt({
        reference: order.reference,
        customerEmail: order.customerEmail,
        tokenJti: tokenPayload.jti,
        clientIp,
        userAgent,
      });

      setPdfHeaders();
      if (diskAvailable) {
        const fallbackStream = fs.createReadStream(fallbackPdfPath);
        fallbackStream.on('error', () => {
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to stream PDF.' });
          }
        });
        return fallbackStream.pipe(res);
      }

      return res.send(generateHerbalGuidePdfBuffer());
    } catch {
      securityLog('error', 'pdf_download_exception');
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Unable to download PDF right now. Please try again.',
        });
      }
    }
  });

  // -----------------------------------------------------------------------------
  // 8. Safe Public Gateway Config Endpoint (Never exposes secret keys)
  // -----------------------------------------------------------------------------
  app.get('/api/paystack/config', (_req, res) => {
    const secretKey = getPaystackSecretKey();
    const publicKey = getPaystackPublicKey();

    const isLiveSecret = secretKey.startsWith('sk_live_');
    const isLivePublic = publicKey.startsWith('pk_live_');
    const keyModeMismatch = Boolean(
      secretKey && publicKey && isLiveSecret !== isLivePublic
    );
    const persistenceConfigured = isSupabaseConfigured();
    const persistenceRequired = isPersistentStoreRequired();
    const persistenceMissing = persistenceRequired && !persistenceConfigured;

    if (keyModeMismatch) {
      securityLog('warn', 'paystack_key_mode_mismatch');
    }

    const keysValid = Boolean(secretKey && publicKey && !keyModeMismatch);
    const isConfigured = Boolean(keysValid && !persistenceMissing);
    const mode: 'live' | 'test' | 'unconfigured' = !isConfigured
      ? 'unconfigured'
      : isLiveSecret && isLivePublic
      ? 'live'
      : 'test';

    let errorMessage: string | undefined;
    if (!secretKey || !publicKey) {
      errorMessage =
        'Paystack API keys are not configured on the server. Add PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in your environment variables.';
    } else if (keyModeMismatch) {
      errorMessage =
        'Paystack key mismatch: PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY must both be Live (sk_live_/pk_live_) or both be Test (sk_test_/pk_test_).';
    } else if (persistenceMissing) {
      errorMessage =
        'Serverless payment persistence is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.';
    }

    return res.json({
      isConfigured,
      isLiveMode: mode === 'live',
      mode,
      backendReachable: true,
      keyModeMismatch,
      persistenceConfigured,
      errorMessage,
      publicKey: keysValid ? publicKey : null,
      supportedChannels: [...PAYSTACK_SUPPORTED_CHANNELS],
    });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      serverless: isServerlessRuntime(),
      persistenceConfigured: isSupabaseConfigured(),
    });
  });

  return app;
}

export function attachErrorHandlers(app: express.Express): void {
  // Global fallback error handler (never leaks stack traces or internals)
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      securityLog('error', 'unhandled_express_error', {
        type: err?.type || 'unknown',
      });
      if (!res.headersSent) {
        res.status(err?.status || 500).json({
          success: false,
          message: 'An unexpected error occurred.',
        });
      }
    }
  );
}
