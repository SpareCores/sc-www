import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { REQUEST, RESPONSE } from './src/express.tokens';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  // access log
  server.use((req, res, next) => {
    const { protocol, originalUrl, ip, headers } = req;
    const log = {
      method: req.method,
      path: originalUrl,
      userAgent: headers['user-agent'],
      ip: headers['x-forwarded-for'] ? (headers['x-forwarded-for'] as string).split(',')[0] : ip,
      country: headers['cloudfront-viewer-country'],
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(log));
    next();
  });

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  //const browserDistFolder = resolve(serverDistFolder, '../browser');
  const browserDistFolder = resolve(serverDistFolder, './static');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files
  server.get('*.*', express.static(browserDistFolder, {
    setHeaders: (res, path) => {
      const generatedJsPattern = /-[A-Z0-9]+\.(js|css|woff2)$/;
      if (generatedJsPattern.test(path)) {
        // generated files with hashed filenames can be cached forever
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // default to cache for 1 hour
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  }));

  // Cache dynamic content for 10 mins
  server.use((req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=600');
    next();
  });

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: RESPONSE, useValue: res },
          { provide: REQUEST, useValue: req },
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 3000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
