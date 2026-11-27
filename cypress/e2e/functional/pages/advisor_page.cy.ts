import { E2EEvent } from "../../../support/generics";

const FILTER_MODAL = 'cdk-dialog-container[role="dialog"]';
const OPEN_FILTERS_BUTTON =
  '.sc-floating-actions sc-button[data-ph-capture-attribute-sc-event="listing filters open"]';
const CLEAR_FILTERS_BUTTON =
  '.sc-floating-actions sc-button[data-ph-capture-attribute-sc-event="listing filters clear"] button';
const APPLY_FILTERS_BUTTON =
  'sc-button[data-ph-capture-attribute-sc-event="filter modal apply"] button';
const MODAL_BASELINE_SERVER_INPUT =
  '[id="filter_modal_custom_control_input_baseline_server"]';
const MODAL_WORKLOAD_INPUT =
  '[id="filter_modal_custom_control_input_server_workload"]';

describe("Advisor page", () => {
  it("Loads the advisor shell and verification panels", () => {
    E2EEvent.visitURL("/advisor");

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
    E2EEvent.visitURL("/advisor");

    cy.get('input[placeholder="Search for server..."]').as(
      "baselineServerInput",
    );

    cy.get("@baselineServerInput")
      .should("be.visible")
      .and("be.enabled")
      .type("gc");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option").should(
      "have.length.greaterThan",
      0,
    );
  });

  it("Matches baseline servers across multiple search terms", () => {
    E2EEvent.visitURL("/advisor");

    cy.get('input[placeholder="Search for server..."]')
      .should("be.visible")
      .and("be.enabled")
      .type("aws large");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .should("contain.text", "aws");
  });

  it("shows the summary alert with empty minimum memory and no baseline placeholders", () => {
    E2EEvent.visitURL("/advisor");

    cy.contains("No matches yet").should("be.visible");
    cy.get('[id="custom_control_numeric_minimum_memory"]').should(
      "have.value",
      "",
    );
    cy.get('[id="custom_control_numeric_minimum_memory"]')
      .siblings(".sc-stepper__unit")
      .should("contain.text", "GiB");
    cy.contains("CPU allocation (...)").should("not.exist");
    cy.contains("CPU architecture (...)").should("not.exist");
    cy.contains("CPU allocation").should("be.visible");
    cy.contains("CPU architecture").should("be.visible");
  });

  it("keeps top actions working and guides focus from baseline server to workload", () => {
    E2EEvent.visitURL("/advisor");

    cy.get('[id="advisor_example_button"] a')
      .should("be.visible")
      .and("have.attr", "href")
      .and("contain", "baseline_vendor=aws")
      .and("contain", "workload_id=workload_profile:web");

    cy.get('[id="advisor_introduction_button"]').should("be.visible").click();
    cy.get('[id="advisor-introduction-modal"]').should("be.visible");
    cy.get('[id="advisor-introduction-modal"] iframe').should(
      "have.attr",
      "title",
      "Spare Cores advisor introduction",
    );
    cy.get('[id="advisor-introduction-modal"] button[type="button"]')
      .first()
      .click({ force: true });
    cy.get('[id="advisor-introduction-modal"]').should("not.exist");

    cy.get('[id="custom_control_input_baseline_server"]').as(
      "baselineServerInput",
    );
    cy.get('[id="custom_control_input_server_workload"]').as(
      "baselineWorkloadInput",
    );

    cy.get("@baselineServerInput")
      .should("be.visible")
      .and("be.enabled")
      .clear()
      .type("aws large");
    cy.get(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .click();

    cy.get("@baselineWorkloadInput", { timeout: 10000 }).should("be.focused");
  });
});

describe("Advisor filter modal", () => {
  it("sets the baseline and a vendor from the modal below xl, then clears them", () => {
    cy.viewport(1024, 900);
    E2EEvent.visitURL("/advisor");

    cy.get(`${OPEN_FILTERS_BUTTON} button`).should("be.visible").click();
    cy.get(FILTER_MODAL).should("be.visible");

    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_tab_advisor"]')
      .should("have.attr", "aria-selected", "true");
    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).should("be.disabled");

    cy.get(FILTER_MODAL)
      .find(MODAL_BASELINE_SERVER_INPUT)
      .should("be.visible")
      .and("be.enabled")
      .type("aws large");
    cy.get(FILTER_MODAL)
      .find(MODAL_BASELINE_SERVER_INPUT)
      .closest(".custom-autocomplete")
      .find(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .click();

    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).should("be.disabled");

    cy.get(FILTER_MODAL)
      .find(MODAL_WORKLOAD_INPUT, { timeout: 10000 })
      .should("be.enabled");
    cy.get(FILTER_MODAL)
      .find(MODAL_WORKLOAD_INPUT)
      .closest(".custom-autocomplete")
      .find(".custom-autocomplete__panel .custom-autocomplete__option")
      .should("have.length.greaterThan", 0)
      .first()
      .click();

    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).should("be.disabled");
    cy.get(FILTER_MODAL)
      .find(".custom-slider__input")
      .invoke("val", 50)
      .trigger("input");
    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).should("be.enabled");

    cy.location("search").should((search) => {
      const params = new URLSearchParams(search);
      expect(params.has("baseline_server")).to.equal(false);
      expect(params.has("workload_id")).to.equal(false);
    });

    cy.get(FILTER_MODAL).find('[id="filter_modal_filter_tab_vendor"]').click();
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_tab_vendor"]')
      .should("have.attr", "aria-selected", "true");
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_enum_vendor_aws"]')
      .check();
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_enum_vendor_aws"]')
      .should("be.checked");

    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).click();
    cy.get(FILTER_MODAL).should("not.exist");

    cy.location("search").should((search) => {
      const params = new URLSearchParams(search);
      expect(params.getAll("vendor")).to.deep.equal(["aws"]);
      expect(params.has("baseline_server")).to.equal(true);
      expect(params.has("workload_id")).to.equal(true);
    });
    cy.get(`${OPEN_FILTERS_BUTTON} .sc-button__badge`).should(($badge) => {
      expect(Number($badge.text().trim())).to.be.at.least(2);
    });

    cy.get(CLEAR_FILTERS_BUTTON).click();

    cy.location("search").should((search) => {
      const params = new URLSearchParams(search);
      expect(params.has("vendor")).to.equal(false);
      expect(params.has("baseline_server")).to.equal(false);
      expect(params.has("workload_id")).to.equal(false);
    });
    cy.get(`${OPEN_FILTERS_BUTTON} .sc-button__badge`).should("not.exist");
  });
});
