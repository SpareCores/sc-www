import { clerkSetup } from "@clerk/testing/cypress";
import getCompareSnapshotPlugin from "cypress-image-diff-js/plugin";
import { defineConfig } from "cypress";
import { writeFileSync } from "node:fs";
import cypressOnFix from "cypress-on-fix";
import cypressSplit from "cypress-split";
import {
  ClerkTestUser,
  createClerkTestUser,
  deleteClerkUserByEmail,
} from "./cypress/support/clerk-users";

const writeShardTimings = (
  results:
    | CypressCommandLine.CypressRunResult
    | CypressCommandLine.CypressFailedRunResult,
) => {
  const outputFile = process.env["SHARD_TIMINGS_FILE"];
  if (!outputFile || !("runs" in results)) {
    return;
  }

  const durations = results.runs
    .filter(({ stats }) => stats.failures === 0 && stats.duration !== undefined)
    .map(({ spec, stats }) => ({
      spec: spec.relative,
      duration: Math.round(stats.duration ?? 0),
    }));

  writeFileSync(outputFile, `${JSON.stringify({ durations }, null, 2)}\n`);
};

const customizeChromeHeadless = (
  browser: Cypress.Browser,
  launchOptions: Cypress.BeforeBrowserLaunchOptions,
) => {
  if (browser.family === "chromium" && browser.isHeadless) {
    launchOptions.args.push("--window-size=1600,1200");
    launchOptions.args.push("--force-device-scale-factor=1");
    launchOptions.args.push("--hide-scrollbars");
  }
  return launchOptions;
};

export default defineConfig({
  videosFolder: "cypress/videos",
  screenshotsFolder: "cypress/screenshots",
  fixturesFolder: "cypress/fixtures",
  defaultCommandTimeout: 12000,
  video: false,
  chromeWebSecurity: false,
  viewportHeight: 1080,
  viewportWidth: 1440,
  experimentalMemoryManagement: true,
  e2e: {
    baseUrl: "http://localhost:4200",
    setupNodeEvents(cypressOn, config) {
      const on = cypressOnFix(cypressOn);
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        createClerkTestUser(user: ClerkTestUser) {
          return createClerkTestUser(user);
        },
        deleteClerkUserByEmail(email: string) {
          return deleteClerkUserByEmail(email);
        },
      });
      getCompareSnapshotPlugin(on, config);
      on("before:browser:launch", customizeChromeHeadless);
      cypressSplit(on, config);
      on("after:run", writeShardTimings);

      const publishableKey = process.env["NG_APP_CLERK_PUBLISHABLE_KEY"];
      const secretKey = process.env["CLERK_SECRET_KEY"];
      const clerkAvailable = !!publishableKey && !!secretKey;
      config.expose = { ...config.expose, CLERK_AVAILABLE: clerkAvailable };
      if (!clerkAvailable) {
        return config;
      }

      return clerkSetup({
        config,
        options: { publishableKey, secretKey },
      });
    },
  },
  numTestsKeptInMemory: 1,
});
