import { E2EEvent } from "../support/generics";

describe("Advisor page", () => {
  it("Loads the advisor shell and verification panels", () => {
    E2EEvent.visitURL("/advisor", 4000);

    E2EEvent.checkBreadcrumbs();
    E2EEvent.isVisible(`[id="serverSearchBar"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="advisor_results_table"]`);
    E2EEvent.isVisible(`[id="advisor_share_button"]`);
    E2EEvent.isVisible(`[id="advisor_compare_baseline_button"]`);
    E2EEvent.isVisible(`[id="advisor_currency_button"]`);
    E2EEvent.isVisible(`[id="advisor_column_button"]`);

    E2EEvent.doesNotExist(`[id="advisor_inputs_panel"]`);
    cy.get(`[id="advisor_results_table"]`).should("contain.text", "PRICE");
  });

  it("Filters baseline servers after two characters", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.get('input[placeholder="Search for server..."]').as(
      "baselineServerInput",
    );

    cy.get("@baselineServerInput").type("gc");
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
    cy.get('[id="custom_control_numeric_minimum_memory"]').should(
      "have.value",
      "0.5",
    );
    cy.get('[id="custom_control_numeric_minimum_memory"]')
      .siblings(".custom-stepper__unit")
      .should("contain.text", "GiB");
  });
});
