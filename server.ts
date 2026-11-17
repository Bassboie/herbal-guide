import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { attachErrorHandlers, createApp, resolveDefaultPrivatePdfPath } from './server/app.ts';
import { securityLog } from './server/security.ts';
import { ensureDefaultPrivateHandbookPdf } from './server/pdfBuilder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = createApp();

  // Ensure default private PDF exists on disk outside public/ and dist/
  try {
    ensureDefaultPrivateHandbookPdf(resolveDefaultPrivatePdfPath());
  } catch {
    securityLog('warn', 'default_private_pdf_init_warning');
  }

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  attachErrorHandlers(app);

  app.listen(PORT, '0.0.0.0', () => {
    securityLog('info', 'server_started', {
      port: PORT,
      env: isProduction ? 'production' : 'development',
    });
  });
}

startServer();
