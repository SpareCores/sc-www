import { registerAuthVisualSuites } from "../../../support/auth-visual";
import { MOBILE_VISUAL_VIEWPORTS } from "../../../support/generics";

MOBILE_VISUAL_VIEWPORTS.forEach(({ prefix, width, height }) => {
  describe(`Auth visual (phone - ${width}x${height})`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    registerAuthVisualSuites(prefix);
  });
});
