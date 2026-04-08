import { E2EEvent } from "../support/generics";

describe("Advisor page", () => {
  it("Loads the advisor shell and verification panels", () => {
    E2EEvent.visitURL("/advisor", 4000);

    E2EEvent.checkBreadcrumbs();
    E2EEvent.isVisible(`[id="serverSearchBar"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="advisor_results_panel"]`);
    E2EEvent.isVisible(`[id="advisor_share_button"]`);

    E2EEvent.doesNotExist(`[id="advisor_inputs_panel"]`);
    cy.get(`[id="advisor_results_panel"]`).should(
      "contain.text",
      "Recommended Servers",
    );
  });
});
