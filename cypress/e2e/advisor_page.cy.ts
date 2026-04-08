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

  it("Filters baseline servers after three characters", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.get('input[placeholder="Search for server..."]').as(
      "baselineServerInput",
    );

    cy.get("@baselineServerInput").type("gc");
    cy.contains("Enter at least 3 characters to search.").should("be.visible");

    cy.get("@baselineServerInput").type("p");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option").should(
      "have.length.greaterThan",
      0,
    );
  });

  it("Matches baseline servers across multiple search terms", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.get('input[placeholder="Search for server..."]').type("aws large");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .should("contain.text", "aws");
  });

  it("Shows the summary alert and default minimum memory value", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.contains("No matches yet").should("be.visible");
    cy.contains("0.5 GB").should("be.visible");
  });
});
