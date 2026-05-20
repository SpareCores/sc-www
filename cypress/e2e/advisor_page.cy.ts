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

  it("shows the summary alert with empty minimum memory and no baseline placeholders", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.contains("No matches yet").should("be.visible");
    cy.get('[id="custom_control_numeric_minimum_memory"]').should(
      "have.value",
      "",
    );
    cy.get('[id="custom_control_numeric_minimum_memory"]')
      .siblings(".custom-stepper__unit")
      .should("contain.text", "GiB");
    cy.contains("CPU allocation (...)").should("not.exist");
    cy.contains("CPU architecture (...)").should("not.exist");
    cy.contains("CPU allocation").should("be.visible");
    cy.contains("CPU architecture").should("be.visible");
  });

  it("keeps top actions working and guides focus from baseline server to workload", () => {
    E2EEvent.visitURL("/advisor", 4000);

    cy.get('[id="advisor_example_button"]')
      .should("be.visible")
      .and("have.attr", "href")
      .and("contain", "baseline_vendor=aws")
      .and("contain", "workload_id=workload_profile:web");

    cy.get('[id="advisor_introduction_button"]').should("be.visible").click();
    cy.get('[id="advisor-introduction-modal"]').should(
      "not.have.class",
      "hidden",
    );
    cy.get('[id="advisor-introduction-modal"] iframe').should(
      "have.attr",
      "title",
      "Spare Cores advisor introduction",
    );
    cy.get('[id="advisor-introduction-modal"] button[type="button"]')
      .first()
      .click({ force: true });
    cy.get('[id="advisor-introduction-modal"]').should("have.class", "hidden");

    cy.get('[id="custom_control_input_baseline_server"]').as(
      "baselineServerInput",
    );
    cy.get('[id="custom_control_input_server_workload"]').as(
      "baselineWorkloadInput",
    );

    cy.get("@baselineServerInput").clear().type("aws large");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .click();

    cy.get("@baselineWorkloadInput", { timeout: 10000 }).should("be.focused");
  });
});
