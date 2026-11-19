import type { IncomingMessage, ServerResponse } from 'http';
import { attachErrorHandlers, createApp } from '../server/app.ts';

// Mark serverless runtime deterministically so Supabase persistence & synchronous webhook processing are enforced
process.env.VERCEL_FUNCTION_RUNTIME = 'true';

// Disable Vercel's built-in body parser so express.raw() receives exact raw bytes for Paystack HMAC-SHA512 webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

const app = createApp();
attachErrorHandlers(app);

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Normalize rewritten Vercel path if ?__vercel_api_path=... was appended by vercel.json
  if (typeof req.url === 'string') {
    const parsed = new URL(req.url, 'http://localhost');
    const rewrittenPath = parsed.searchParams.get('__vercel_api_path');

    if (rewrittenPath !== null) {
      parsed.searchParams.delete('__vercel_api_path');
      const cleanSubpath = rewrittenPath.replace(/^\/+/, '');
      const remainingQuery = parsed.searchParams.toString();

      if (parsed.pathname === '/api/index' || parsed.pathname === '/api') {
        req.url = `/api/${cleanSubpath}${remainingQuery ? `?${remainingQuery}` : ''}`;
      } else {
        req.url = `${parsed.pathname}${remainingQuery ? `?${remainingQuery}` : ''}`;
      }
    }
  }

  return app(req as any, res as any);
}
