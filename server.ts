import os from 'os';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { REQUEST, RESPONSE } from './src/express.tokens';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
//const browserDistFolder = resolve(serverDistFolder, './static');
const indexHtml = join(serverDistFolder, 'index.server.html');

const SMTP_HOST = process.env['SMTP_HOST'] || '';
const SMTP_PORT = parseInt(process.env['SMTP_PORT'] || '587', 10);
const SMTP_USER = process.env['SMTP_USER'] || '';
const SMTP_PASS = process.env['SMTP_PASS'] || '';
const CONTACT_FORM_FROM = process.env['CONTACT_FORM_FROM'] || process.env['SMTP_USER'] || '';
const CONTACT_FORM_TO = process.env['CONTACT_FORM_TO'] || '';
const POW_SECRET_KEY = process.env['POW_SECRET_KEY'] || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

class EmailTemplateManager {
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private templateDir: string = resolve(browserDistFolder, 'email-templates');

  async getTemplate(name: string): Promise<handlebars.TemplateDelegate> {
    const cached = this.templates.get(name);
    if (cached) return cached;
    try {
      const fs = await import('fs/promises');
      const templatePath = join(this.templateDir, `${name}.hbs`);
      const source = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(source);
      this.templates.set(name, compiled);
      return compiled;
    } catch (error) {
      console.error(`Failed to load email template '${name}':`, error);
      throw new Error(`Email template '${name}' not found`);
    }
  }

  clearCache() {
    this.templates.clear();
  }
}
const emailTemplates = new EmailTemplateManager();

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const loggerData: Record<string, any> = {};

  // access log
  server.use((req, res, next) => {
    loggerData.startTime = new Date();
    loggerData.resourceUsage = process.resourceUsage();
    const { protocol, originalUrl, ip, headers } = req;
    const log = {
      event: "request",
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

  const commonEngine = new CommonEngine({
    enablePerformanceProfiler: process.env['ENABLE_PERFORMANCE_PROFILER'] === "true",
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // return early with stats
  server.get('/healthcheck', (req, res) => {
    const stats = {
      status: 'healthy',
      host: os.hostname(),
      memory: {
        maxRss: loggerData.resourceUsage.maxRSS,
      },
      cpu: {
        user: loggerData.resourceUsage.userCPUTime,
        sys: loggerData.resourceUsage.systemCPUTime,
      },
      uptime: process.uptime().toFixed(2)
    };
    return res.status(200).json(stats);
  });

  // generate PoW challenge for the contact form
  server.get('/api/generate-pow-challenge', (req, res) => {
    const timestamp = Date.now();
    const challenge = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', POW_SECRET_KEY);
    hmac.update(`${challenge}:${timestamp}`);
    const signature = hmac.digest('hex');
    console.log(JSON.stringify({"event": "generate-pow-challenge", "challenge": challenge, "timestamp": timestamp, "signature": signature}));
    return res.status(200).json({ challenge, timestamp, signature });
  });

  // handle contact form submission
  server.post('/api/contact', express.json(), async (req, res) => {
    console.log(JSON.stringify({"event": "contact", "body": req.body}));

    const { powChallenge, powTimestamp, powSignature, powSolution, name, affiliation, email, phone, message } = req.body;

    // verify that the PoW challenge was not tampered with
    const hmac = crypto.createHmac('sha256', POW_SECRET_KEY);
    hmac.update(`${powChallenge}:${powTimestamp}`);
    const expectedSignature = hmac.digest('hex');
    if (expectedSignature !== powSignature) {
      return res.status(400).json({ error: 'Invalid PoW signature' });
    }

    // verify that the PoW challenge is not too old
    const currentTime = Date.now();
    const fiveMinutesInMillis = 5 * 60 * 1000;
    if (currentTime - powTimestamp > fiveMinutesInMillis) {
      return res.status(400).json({ error: 'PoW timestamp is too old' });
    }

    // verify the PoW solution
    const hash = crypto.createHash('sha256');
    hash.update(powChallenge + powSolution);
    const powHash = hash.digest('hex');
    const difficulty = '0000';
    if (!powHash.startsWith(difficulty)) {
      return res.status(400).json({ error: 'Invalid PoW solution' });
    }

    // send email using the contact template
    try {
      const template = await emailTemplates.getTemplate('contact');
      const htmlContent = template({
        name,
        affiliation,
        email,
        phone,
        message
      });
      console.log(htmlContent);
      await transporter.sendMail({
        from: CONTACT_FORM_FROM,
        to: CONTACT_FORM_TO,
        subject: `New Contact Form Message from ${name}`,
        html: htmlContent,
        replyTo: email
      });
      return res.status(200).json({ status: 'Message sent' });
    } catch (error) {
      console.error('Failed to send email:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // redirect from www
  server.use((req, res, next) => {
    const host = req.hostname;
    if (host.startsWith('www.')) {
      const newHost = host.substring(4);
      return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
    }
    next();
  });

  // cache headers for the static files
  server.use((req, res, next) => {
    const generatedJsPattern = /-[A-Z0-9]+\.(js|css|woff2)$/;
    if (req.path === '/assets/giscus.css') {
      // CORS for hosted file referencing external resources
      res.setHeader('Access-Control-Allow-Origin', 'https://giscus.app');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else if (generatedJsPattern.test(req.path)) {
      // Generated files with hashed filenames can be cached forever
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Default cache for 1 hour
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    next();
  });

  // Serve static files
  server.get('*.*', express.static(browserDistFolder));

  // Cache dynamic content for 10 mins
  server.use((req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=600');
    next();
  });

  // log time to generate dynamic content
  server.use((req, res, next) => {
    res.on("close", () => {
      const currentResourceUsage = process.resourceUsage();
      const currentTime = new Date();
      const elapsedTime = (currentTime.getTime() - loggerData.startTime.getTime()) / 1e3;
      const userTime = (currentResourceUsage.userCPUTime - loggerData.resourceUsage.userCPUTime) / 1e6;
      const sysTime = (currentResourceUsage.systemCPUTime - loggerData.resourceUsage.systemCPUTime) / 1e6;
      const log = {
        event: "response",
        path: req.originalUrl,
        real: elapsedTime.toFixed(2),
        user: userTime.toFixed(2),
        sys: sysTime.toFixed(2),
        wait: (elapsedTime - userTime - sysTime).toFixed(2),
      }
      console.log(JSON.stringify(log));
    })
    next()
  })

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
