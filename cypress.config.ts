import { defineConfig } from "cypress";

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  defaultCommandTimeout: 120000,
  video: false,
  chromeWebSecurity: false,
  viewportHeight: 1080,
  viewportWidth: 1440,
  e2e: {
    baseUrl: 'http://localhost:4300',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  numTestsKeptInMemory: 1,
});
