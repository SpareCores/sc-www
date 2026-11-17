import compareSnapshotCommand from "cypress-image-diff-js/command";

compareSnapshotCommand();

Cypress.on("window:before:load", (win) => {
  Object.assign(win, { __scE2e: true });
});
