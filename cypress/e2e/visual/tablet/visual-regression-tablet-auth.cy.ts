import { registerAuthVisualSuites } from "../../../support/auth-visual";
import { TABLET_VISUAL_VIEWPORTS } from "../../../support/generics";

TABLET_VISUAL_VIEWPORTS.forEach(({ prefix, width, height }) => {
  describe(`Auth visual (tablet - ${width}x${height})`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    registerAuthVisualSuites(prefix);
  });
});
