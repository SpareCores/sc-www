const config = {
  REPORT_DIR: "./cypress-image-diff-html-report",
  SCREENSHOTS_DIR: "./cypress-image-diff-screenshots",
  FAIL_ON_MISSING_BASELINE: true,
  JSON_REPORT: {
    OVERWRITE: true,
    FILENAME: "report",
  },
};

module.exports = config;
