import { clerkSetup } from "@clerk/testing/cypress";
import getCompareSnapshotPlugin from "cypress-image-diff-js/plugin";
import { defineConfig } from "cypress";
import { deleteClerkUserByEmail } from "./cypress/support/clerk-users";

const customizeChromeHeadless = (
  browser: Cypress.Browser,
  launchOptions: Cypress.BeforeBrowserLaunchOptions,
) => {
  if (browser.family === "chromium" && browser.isHeadless) {
    launchOptions.args.push("--window-size=1440,1080");
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
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        deleteClerkUserByEmail(email: string) {
          return deleteClerkUserByEmail(email);
        },
      });
      on("before:browser:launch", customizeChromeHeadless);

      getCompareSnapshotPlugin(on, config);
      const publishableKey = process.env["NG_APP_CLERK_PUBLISHABLE_KEY"];
      if (publishableKey && !process.env["CLERK_PUBLISHABLE_KEY"]) {
        process.env["CLERK_PUBLISHABLE_KEY"] = publishableKey;
        config.env = {
          ...config.env,
          CLERK_PUBLISHABLE_KEY: publishableKey,
        };
      }

      return clerkSetup({ config });
    },
  },
  numTestsKeptInMemory: 1,
});
