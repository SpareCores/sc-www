// @ts-expect-error: TS2307
import getCompareSnapshotPlugin from "cypress-image-diff-js/plugin";
import { defineConfig } from "cypress";

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
      return getCompareSnapshotPlugin(on, config);
    },
  },
  numTestsKeptInMemory: 1,
});
