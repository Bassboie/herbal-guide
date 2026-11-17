import serverless from 'serverless-http';
import { attachErrorHandlers, createApp } from '../../server/app.ts';

// Mark serverless runtime deterministically so persistent Supabase storage & synchronous webhook completion are enforced
process.env.NETLIFY_FUNCTION_RUNTIME = 'true';

const app = createApp();
attachErrorHandlers(app);

const expressHandler = serverless(app, {
  binary: ['application/pdf', 'application/octet-stream'],
  request(request: any, event: any) {
    // Normalize paths if Netlify forwards /.netlify/functions/api/... instead of /api/...
    if (typeof request.url === 'string') {
      if (request.url.startsWith('/.netlify/functions/api/')) {
        request.url = `/api/${request.url.slice('/.netlify/functions/api/'.length)}`;
      } else if (request.url === '/.netlify/functions/api') {
        request.url = '/api';
      }
    }

    // Preserve raw webhook bytes for constant-time HMAC-SHA512 signature verification
    if (event && typeof event.body === 'string' && !Buffer.isBuffer(request.body)) {
      const rawBuf = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
      request.rawBody = rawBuf;
    }
  },
});

export const handler = async (event: any, context: any) => {
  // Normalize Netlify Function path before serverless-http routing
  if (event && typeof event.path === 'string') {
    if (event.path.startsWith('/.netlify/functions/api/')) {
      event.path = `/api/${event.path.slice('/.netlify/functions/api/'.length)}`;
    } else if (event.path === '/.netlify/functions/api') {
      event.path = '/api';
    }
  }

  return expressHandler(event, context);
};
