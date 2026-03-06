#!/usr/bin/env tsx
import { execSync } from "child_process";
import { rmSync, cpSync, existsSync } from "fs";
import path from "path";

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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const totalStart = Date.now();

console.log(`\n${C.bold}${C.cyan}${"═".repeat(55)}${C.reset}`);
console.log(`${C.bold}${C.cyan}  🚀  Spare Cores Production Build${C.reset}`);
console.log(`${C.bold}${C.cyan}${"═".repeat(55)}${C.reset}`);

// Read and validate --configuration flag (default: production)
const ALLOWED_CONFIGS = new Set(["production", "development", "local-test"]);
const configArg = process.argv.find((a) => a.startsWith("--configuration="));
const configFromArg = configArg?.split("=")[1]?.trim();
const config =
  configFromArg && ALLOWED_CONFIGS.has(configFromArg)
    ? configFromArg
    : "production";
console.log(`\n  ${C.dim}configuration:${C.reset} ${cy(config)}`);

// ─── Step 1: Prebuild ──────────────────────────────────────────────────────
step("📋", "Running prebuild (articles · slides · sitemap)");
const t1 = Date.now();
try {
  execSync("node ./prebuild.js", { stdio: "inherit" });
  console.log(ok(`Prebuild done  ${C.dim}(${elapsed(t1)})${C.reset}`));
} catch {
  console.error(er("Prebuild failed — aborting."));
  process.exit(1);
}

// ─── Step 2: ng build ──────────────────────────────────────────────────────
step("📦", `Compiling Angular app  [${cy(config)}]`);
const t2 = Date.now();
try {
  execSync(`ng build --configuration=${config} --progress=true`, {
    stdio: "inherit",
  });
  console.log(ok(`Angular build done  ${C.dim}(${elapsed(t2)})${C.reset}`));
} catch {
  console.error(er("Angular build failed — aborting."));
  process.exit(1);
}

// ─── Step 3: Copy browser → server/static ─────────────────────────────────
step("📂", "Syncing browser assets → dist/sc-www/server/static");
const t3 = Date.now();
const browserDir = path.join("dist", "sc-www", "browser");
const staticDir = path.join("dist", "sc-www", "server", "static");
try {
  if (!existsSync(browserDir)) {
    throw new Error(`Browser output not found at ${browserDir}`);
  }
  rmSync(staticDir, { recursive: true, force: true });
  cpSync(browserDir, staticDir, { recursive: true });
  console.log(
    ok(`Assets copied  ${C.dim}(${elapsed(t3)})  →  ${staticDir}${C.reset}`),
  );
} catch (e) {
  console.error(er(`Asset copy failed: ${(e as Error).message}`));
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
