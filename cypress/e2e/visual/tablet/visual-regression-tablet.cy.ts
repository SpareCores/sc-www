import { TABLET_VISUAL_VIEWPORTS } from "../../../support/generics";
import {
  registerMobileMenuSuite,
  registerVisualSuites,
} from "../../../support/visual";

TABLET_VISUAL_VIEWPORTS.forEach(({ prefix, width, height }) => {
  describe(`Visual regression tests (tablet - ${width}x${height})`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    registerVisualSuites(prefix);
    registerMobileMenuSuite(prefix);
  });
});
