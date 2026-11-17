import {
  registerMobileMenuSuite,
  registerVisualSuites,
} from "../../../support/visual";

describe("Visual regression tests (small screen - 800px)", () => {
  beforeEach(() => {
    cy.viewport(800, 900);
  });

  registerVisualSuites("mobile");
  registerMobileMenuSuite("mobile");
});
