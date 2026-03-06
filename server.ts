import os from "os";
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from "@angular/ssr/node";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import rateLimit from "express-rate-limit";

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
//const browserDistFolder = resolve(serverDistFolder, '../browser');
const browserDistFolder = resolve(serverDistFolder, "./static");

const SMTP_HOST = process.env["SMTP_HOST"] || "";
const SMTP_PORT = parseInt(process.env["SMTP_PORT"] || "587", 10);
const SMTP_USER = process.env["SMTP_USER"] || "";
const SMTP_PASS = process.env["SMTP_PASS"] || "";
const CONTACT_FORM_FROM =
  process.env["CONTACT_FORM_FROM"] || process.env["SMTP_USER"] || "";
const CONTACT_FORM_TO = process.env["CONTACT_FORM_TO"] || "";
const POW_SECRET_KEY = process.env["POW_SECRET_KEY"] || "";
const S3_BUCKET_URL = process.env["S3_BUCKET_URL"] || "";
// fail healthcheck if RSS is too high (restart due to memory leak)
const RSS_LIMIT_MB = parseInt(process.env["RSS_LIMIT_MB"] || "600", 10);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// max 50 PoW challenge requests from the same IP per 5 minutes
const powLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: { error: "Too many PoW challenge requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

class EmailTemplateManager {
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private templateDir: string = resolve(browserDistFolder, "email-templates");

  async getTemplate(name: string): Promise<handlebars.TemplateDelegate> {
    const cached = this.templates.get(name);
    if (cached) return cached;
    try {
      const fs = await import("fs/promises");
      const templatePath = join(this.templateDir, `${name}.hbs`);
      const source = await fs.readFile(templatePath, "utf-8");
      const compiled = handlebars.compile(source);
      this.templates.set(name, compiled);
      return compiled;
    } catch (error) {
      console.error(`Failed to load email template '${name}':`, error);
      throw new Error(`Email template '${name}' not found`);
    }
  }
}
const emailTemplates = new EmailTemplateManager();

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  // access log
  server.use((req, res, next) => {
    res.locals["requestStartTime"] = Date.now();

    // LOG IMMEDIATELY, DO NOT ATTACH OBJECTS TO REQ
    const { originalUrl, ip, headers } = req;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "request",
        method: req.method,
        path: originalUrl,
        ip: headers["x-forwarded-for"]
          ? (headers["x-forwarded-for"] as string).split(",")[0]
          : ip,
      }),
    );
    next();
  });

  const engine = new AngularNodeAppEngine();

  server.set("view engine", "html");
  server.set("views", browserDistFolder);

  // return early with stats
  server.get("/healthcheck", (req, res) => {
    const currentResourceUsage = process.resourceUsage();
    const stats = {
      status: "healthy",
      host: os.hostname(),
      memory: {
        maxRss: currentResourceUsage.maxRSS, // kB
      },
      cpu: {
        user: currentResourceUsage.userCPUTime,
        sys: currentResourceUsage.systemCPUTime,
      },
      uptime: process.uptime().toFixed(2),
    };
    if (currentResourceUsage.maxRSS > RSS_LIMIT_MB * 1024) {
      return res.status(500).json({ error: "RSS limit exceeded" });
    }
    return res.status(200).json(stats);
  });

  // generate PoW challenge for the contact form
  server.get("/api/generate-pow-challenge", powLimiter, (req, res) => {
    const timestamp = Date.now();
    const challenge = crypto.randomBytes(16).toString("hex");
    const hmac = crypto.createHmac("sha256", POW_SECRET_KEY);
    hmac.update(`${challenge}:${timestamp}`);
    const signature = hmac.digest("hex");
    console.log(
      JSON.stringify({
        event: "generate-pow-challenge",
        challenge: challenge,
        timestamp: timestamp,
        signature: signature,
      }),
    );
    return res.status(200).json({ challenge, timestamp, signature });
  });

  // handle contact form submission
  server.post("/api/contact", express.json(), async (req, res) => {
    console.log(JSON.stringify({ event: "contact", body: req.body }));

    const {
      powChallenge,
      powTimestamp,
      powSignature,
      powSolution,
      name,
      affiliation,
      email,
      phone,
      message,
    } = req.body;

    // verify that the PoW challenge was not tampered with
    const hmac = crypto.createHmac("sha256", POW_SECRET_KEY);
    hmac.update(`${powChallenge}:${powTimestamp}`);
    const expectedSignature = hmac.digest("hex");
    if (expectedSignature !== powSignature) {
      return res.status(400).json({ error: "Invalid PoW signature" });
    }

    // verify that the PoW challenge is not too old
    const currentTime = Date.now();
    const fiveMinutesInMillis = 5 * 60 * 1000;
    if (currentTime - powTimestamp > fiveMinutesInMillis) {
      return res.status(400).json({ error: "PoW timestamp is too old" });
    }

    // verify the PoW solution
    const hash = crypto.createHash("sha256");
    hash.update(powChallenge + powSolution);
    const powHash = hash.digest("hex");
    const difficulty = "0000";
    if (!powHash.startsWith(difficulty)) {
      return res.status(400).json({ error: "Invalid PoW solution" });
    }

    // send email using the contact template
    try {
      const template = await emailTemplates.getTemplate("contact");
      const htmlContent = template({
        name,
        affiliation,
        email,
        phone,
        message,
      });
      console.log(htmlContent);
      await transporter.sendMail({
        from: CONTACT_FORM_FROM,
        to: CONTACT_FORM_TO,
        subject: `New Contact Form Message from ${name}`,
        html: htmlContent,
        replyTo: email,
      });
      return res.status(200).json({ status: "Message sent" });
    } catch (error) {
      console.error("Failed to send email:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  // handle survey data submission
  server.post("/api/survey-data", express.json(), async (req, res) => {
    try {
      const { filename, payload } = req.body;
      const enrichedPayload = {
        ...payload,
        clientInfo: {
          ip: req.headers["x-forwarded-for"]
            ? (req.headers["x-forwarded-for"] as string).split(",")[0]
            : req.ip,
          userAgent: req.headers["user-agent"],
          country: req.headers["cloudfront-viewer-country"],
          timestamp: new Date().toISOString(),
        },
      };
      console.log(
        JSON.stringify({
          event: "survey-data-submission",
          filename: filename,
          payload: enrichedPayload,
          ip: enrichedPayload.clientInfo.ip,
          timestamp: enrichedPayload.clientInfo.timestamp,
        }),
      );

      const url = new URL(filename, S3_BUCKET_URL);
      const data = JSON.stringify(enrichedPayload);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(req.headers["referer"]
            ? { Referer: req.headers["referer"] as string }
            : {}),
        },
        body: data,
      });
      if (!response.ok) {
        console.error(
          `Failed to save survey data to S3: Status ${response.status}`,
        );
        return res.status(500).json({ error: "Failed to save survey data" });
      }
      return res.status(200).json({ status: "Survey data saved" });
    } catch (error) {
      console.error("Failed to save survey data to S3:", error);
      return res.status(500).json({ error: "Failed to save survey data" });
    }
  });

  // redirect from www
  server.use((req, res, next) => {
    const host = req.hostname;
    if (host.startsWith("www.")) {
      const newHost = host.substring(4);
      return res.redirect(
        301,
        `${req.protocol}://${newHost}${req.originalUrl}`,
      );
    }
    next();
  });

  // cache headers for the static files
  server.use((req, res, next) => {
    const generatedJsPattern = /-[A-Z0-9]+\.(js|css|woff2)$/;
    if (req.path === "/assets/giscus.css") {
      // CORS for hosted file referencing external resources
      res.setHeader("Access-Control-Allow-Origin", "https://giscus.app");
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET");
      res.setHeader("Cache-Control", "public, max-age=86400");
    } else if (generatedJsPattern.test(req.path)) {
      // Generated files with hashed filenames can be cached forever
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      // Default cache for 1 hour
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
    next();
  });

  // Serve static files
  server.get("*.*", express.static(browserDistFolder));

  // Cache dynamic content for 10 mins
  server.use((req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=600");
    next();
  });

  // log time it takes to generate dynamic content
  server.use((req, res, next) => {
    let loggedResponse = false;

    const logResponse = () => {
      if (loggedResponse) return;
      loggedResponse = true;

      const startTime = res.locals["requestStartTime"];
      if (startTime) {
        const elapsedTime = (Date.now() - startTime) / 1000;

        const log: Record<string, unknown> = {
          timestamp: new Date().toISOString(),
          event: "response",
          path: req.originalUrl,
          real: elapsedTime.toFixed(2),
        };

        // Only attach memory snapshot on slow requests (>2 s) to avoid
        // allocating a memoryUsage object + large JSON string on every request.
        if (elapsedTime > 2) {
          log["memory"] = process.memoryUsage();
        }

        console.log(JSON.stringify(log));
      }

      res.removeListener("finish", logResponse);
      res.removeListener("close", logResponse);
    };

    res.once("finish", logResponse);
    res.once("close", logResponse);
    next();
  });

  // All regular routes use the Angular engine
  server.get("*", (req, res, next) => {
    const { originalUrl } = req;

    const renderTimeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`SSR timeout for ${originalUrl}`);
        res.status(500).send("Server rendering timeout");
      }
    }, 30000);

    engine
      .handle(req)
      .then(async (response) => {
        clearTimeout(renderTimeout);
        if (response) {
          await writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch((err) => {
        clearTimeout(renderTimeout);
        console.error("SSR Error:", err);
        next(err);
      });
  });

  return server;
}

const expressApp = app();

export default createNodeRequestHandler(expressApp);

if (isMainModule(import.meta.url)) {
  const port = process.env["PORT"] || 3000;
  expressApp.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
