import {
  registerMobileMenuSuite,
  registerVisualSuites,
} from "../../../support/visual";

describe("Visual regression tests (medium screen - 1024px)", () => {
  beforeEach(() => {
    cy.viewport(1024, 900);
  });

  registerVisualSuites("tablet");

  describe("mobile menu (960px)", () => {
    beforeEach(() => {
      cy.viewport(960, 900);
    });

    registerMobileMenuSuite("tablet");
  });
});
