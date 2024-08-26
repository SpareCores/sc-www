import * as Sentry from "@sentry/node";

const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN_NODE;
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';
const SENTRY_ENVIRONMENT = import.meta?.env?.NG_APP_SENTRY_ENVIRONMENT || 'development';
const SENTRY_RELEASE = import.meta?.env?.NG_APP_SENTRY_RELEASE || undefined;

const BACKEND_BASE_URI = import.meta.env['NG_APP_BACKEND_BASE_URI'];


if(SENTRY_DSN && SENTRY_DSN !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT + 'server',
    release: SENTRY_RELEASE,

    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    tracePropagationTargets: ['localhost', /^\//, BACKEND_BASE_URI],
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

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
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  Sentry.setupExpressErrorHandler(server);

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    Sentry.startSpan(
      { name: `${originalUrl}`,
        op: 'render',
        forceTransaction: true },
      async () => {
        const result = await commonEngine
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
          });
        return result;
      },
    ).then((html: any) => res.send(html))
    .catch((err: any) => next(err));

    /*
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
      */
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
