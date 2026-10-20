import { registerAuthVisualSuites } from "../support/auth-visual";

describe("Auth visual (small screen - 800px)", () => {
  beforeEach(() => {
    cy.viewport(800, 900);
  });

  registerAuthVisualSuites("-small");
});
