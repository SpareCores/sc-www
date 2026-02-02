// @ts-expect-error: TS2307
import getCompareSnapshotPlugin from "cypress-image-diff-js/plugin";
import { defineConfig } from "cypress";

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
      });
      on("before:browser:launch", customizeChromeHeadless);

      return getCompareSnapshotPlugin(on, config);
    },
  },
  numTestsKeptInMemory: 1,
});
