import { registerAuthVisualSuites } from "../support/auth-visual";

describe("Auth visual (medium screen - 1024px)", () => {
  beforeEach(() => {
    cy.viewport(1024, 900);
  });

  registerAuthVisualSuites("-medium");
});
