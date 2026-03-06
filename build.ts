#!/usr/bin/env tsx
import { execFileSync } from "child_process";

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};
const cy = (s: string) => `${C.cyan}${s}${C.reset}`;
const hd = (s: string) => `${C.bold}${C.blue}${s}${C.reset}`;
const ok = (s: string) => `${C.bold}${C.green}✅  ${s}${C.reset}`;
const er = (s: string) => `${C.bold}${C.red}❌  ${s}${C.reset}`;

const SEP = `${C.dim}${"─".repeat(55)}${C.reset}`;

function step(icon: string, label: string): void {
  console.log(`\n${SEP}`);
  console.log(`${icon}  ${hd(label)}`);
  console.log(SEP);
}

function elapsed(start: number): string {
  return `${((Date.now() - start) / 1000).toFixed(1)}s`;
}

function envOrDefault(names: string[], fallback: string): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  return fallback;
}

function resolveBuildEnv(configuration: string) {
  const isLocalTest = configuration === "local-test";

  return {
    backendBaseUri: envOrDefault(
      ["BACKEND_BASE_URI"],
      isLocalTest ? "http://localhost:8080" : "https://keeper.sparecores.net",
    ),
    backendBaseUriSsr: envOrDefault(
      ["BACKEND_BASE_URI_SSR"],
      isLocalTest ? "http://localhost:8080" : "https://keeper.sparecores.net",
    ),
    posthogKey: envOrDefault(
      ["POSTHOG_KEY", "NG_APP_POSTHOG_KEY"],
      "phc_Fi3yxUniDNXMI6VBP25WSDQSTKiTrNd5UfY5siQoZMT",
    ),
    posthogHost: envOrDefault(
      ["POSTHOG_HOST", "NG_APP_POSTHOG_HOST"],
      "https://eu.posthog.com",
    ),
    sentryDsn: envOrDefault(["SENTRY_DSN", "NG_APP_SENTRY_DSN"], ""),
    sentryTraceSampleRate: envOrDefault(
      ["SENTRY_TRACE_SAMPLE_RATE", "NG_APP_SENTRY_TRACE_SAMPLE_RATE"],
      "0",
    ),
    sentryProfileSampleRate: envOrDefault(
      ["SENTRY_PROFILE_SAMPLE_RATE", "NG_APP_SENTRY_PROFILE_SAMPLE_RATE"],
      "0",
    ),
    sentryEnvironment: envOrDefault(
      ["SENTRY_ENVIRONMENT", "NG_APP_SENTRY_ENVIRONMENT"],
      isLocalTest ? "development" : "production",
    ),
    sentryRelease:
      process.env["SENTRY_RELEASE"] ||
      process.env["NG_APP_SENTRY_RELEASE"] ||
      undefined,
  };
}

function defineArg(name: string, value: string | undefined): string {
  const literal = value === undefined ? "undefined" : JSON.stringify(value);
  return `--define=import.meta.env.${name}=${literal}`;
}

function runNgBuild(args: string[]): void {
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/d", "/s", "/c", "ng", ...args], {
      stdio: "inherit",
    });
    return;
  }

  execFileSync("ng", args, { stdio: "inherit" });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const totalStart = Date.now();

// Read and validate --configuration flag (default: production)
const ALLOWED_CONFIGS = new Set(["production", "development", "local-test"]);
const configArg = process.argv.find((a) => a.startsWith("--configuration="));
const configFromArg = configArg?.split("=")[1]?.trim();
const config =
  configFromArg && ALLOWED_CONFIGS.has(configFromArg)
    ? configFromArg
    : "production";

const buildLabel =
  config === "local-test"
    ? "Spare Cores Local Test Build"
    : config === "development"
      ? "Spare Cores Development Build"
      : "Spare Cores Production Build";

console.log(`\n${C.bold}${C.cyan}${"═".repeat(55)}${C.reset}`);
console.log(`${C.bold}${C.cyan}  🚀  ${buildLabel}${C.reset}`);
console.log(`${C.bold}${C.cyan}${"═".repeat(55)}${C.reset}`);
console.log(`\n  ${C.dim}configuration:${C.reset} ${cy(config)}`);

const buildEnv = resolveBuildEnv(config);

console.log(`  ${C.dim}client api:${C.reset} ${cy(buildEnv.backendBaseUri)}`);
console.log(
  `  ${C.dim}ssr api:${C.reset}    ${cy(buildEnv.backendBaseUriSsr)}`,
);

// ─── Step 1: Prebuild ──────────────────────────────────────────────────────
step("📋", "Running prebuild (articles · slides · sitemap)");
const t1 = Date.now();
try {
  execFileSync("node", ["./prebuild.js"], { stdio: "inherit" });
  console.log(ok(`Prebuild done  ${C.dim}(${elapsed(t1)})${C.reset}`));
} catch {
  console.error(er("Prebuild failed — aborting."));
  process.exit(1);
}

// ─── Step 2: ng build ──────────────────────────────────────────────────────
step("📦", `Compiling Angular app  [${cy(config)}]`);
const t2 = Date.now();
try {
  runNgBuild([
    "build",
    `--configuration=${config}`,
    "--progress=true",
    defineArg("NG_APP_BACKEND_BASE_URI", buildEnv.backendBaseUri),
    defineArg("NG_APP_BACKEND_BASE_URI_SSR", buildEnv.backendBaseUriSsr),
    defineArg("NG_APP_POSTHOG_KEY", buildEnv.posthogKey),
    defineArg("NG_APP_POSTHOG_HOST", buildEnv.posthogHost),
    defineArg("NG_APP_SENTRY_DSN", buildEnv.sentryDsn),
    defineArg(
      "NG_APP_SENTRY_TRACE_SAMPLE_RATE",
      buildEnv.sentryTraceSampleRate,
    ),
    defineArg(
      "NG_APP_SENTRY_PROFILE_SAMPLE_RATE",
      buildEnv.sentryProfileSampleRate,
    ),
    defineArg("NG_APP_SENTRY_ENVIRONMENT", buildEnv.sentryEnvironment),
    defineArg("NG_APP_SENTRY_RELEASE", buildEnv.sentryRelease),
  ]);

  console.log(ok(`Angular build done  ${C.dim}(${elapsed(t2)})${C.reset}`));
} catch (error) {
  if (error instanceof Error) {
    console.error(er(error.message));
  }
  console.error(er("Angular build failed — aborting."));
  process.exit(1);
}

// ─── Done ──────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.green}${"═".repeat(55)}${C.reset}`);
console.log(
  `${C.bold}${C.green}  ✅  Build complete  ${C.dim}(total: ${elapsed(totalStart)})${C.reset}`,
);
console.log(
  `${C.bold}${C.green}  📡  Start with:  npm run serve:ssr:sc-www${C.reset}`,
);
console.log(`${C.bold}${C.green}${"═".repeat(55)}${C.reset}\n`);
