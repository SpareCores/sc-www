import { MOBILE_VISUAL_VIEWPORTS } from "../../../support/generics";
import {
  registerMobileMenuSuite,
  registerVisualSuites,
} from "../../../support/visual";

MOBILE_VISUAL_VIEWPORTS.forEach(({ prefix, width, height }) => {
  describe(`Visual regression tests (phone - ${width}x${height})`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    registerVisualSuites(prefix);
    registerMobileMenuSuite(prefix);
  });
});
