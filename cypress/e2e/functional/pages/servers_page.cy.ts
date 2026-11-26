import { E2EEvent } from "../../../support/generics";

const SERVERS_SEARCH_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/servers(?:\?.*)?$/;
const API_WAIT_MS = 30000;
const FILTER_MODAL = 'cdk-dialog-container[role="dialog"]';
const OPEN_FILTERS_BUTTON =
  '.sc-floating-actions sc-button[data-ph-capture-attribute-sc-event="listing filters open"]';
const CLEAR_FILTERS_BUTTON =
  '.sc-floating-actions sc-button[data-ph-capture-attribute-sc-event="listing filters clear"] button';
const APPLY_FILTERS_BUTTON =
  'sc-button[data-ph-capture-attribute-sc-event="filter modal apply"] button';

describe("Server listing", () => {
  it("Test /servers page", () => {
    E2EEvent.visitURL("/servers");

    E2EEvent.checkBreadcrumbs();

    // search bar visible and not visible fields
    E2EEvent.isVisible(`[id="serverSearchBar"]`);
    E2EEvent.isVisible(`[id="filter_range_value_vcpus_min"]`);
    E2EEvent.doesNotExist(`[id="filter_title_partial_name_or_id"]`);
    E2EEvent.doesNotExist(
      `[id="filter_number_benchmark_score_stressng_cpu_min"]`,
    );

    // columns' dropwdown button
    E2EEvent.isVisible(`[id="column_button"]`);

    // data table
    E2EEvent.isVisibleAndNotEmpty(`[id="servers_table"]`);

    // count lines
    E2EEvent.countElements(
      `[id="servers_table"]`,
      `.server_table_data_line`,
      25,
    );

    // pagination
    E2EEvent.isVisible(`[id="pagination_next_arrow"]`);
    E2EEvent.doesNotExist(`[id="pagination_prev_arrow"]`);

    E2EEvent.visitURL(
      "/server_prices?vcpus_min=11&benchmark_score_stressng_cpu_min=200&page=2",
    );

    // we are on page 2 now
    E2EEvent.isVisible(`[id="pagination_prev_arrow"]`);

    E2EEvent.hasValue(`filter_range_value_vcpus_min`, "11");
    E2EEvent.isVisibleAndNotEmpty(
      `[id="filter_title_benchmark_score_stressng_cpu_min"]`,
    );

    E2EEvent.hasValue(`filter_number_benchmark_score_stressng_cpu_min`, "200");
  });
});

describe("Server listing filter modal", () => {
  it("applies and clears a filter from the modal below xl", () => {
    cy.viewport(1024, 900);
    cy.intercept({
      method: "GET",
      url: SERVERS_SEARCH_ROUTE,
      query: { architecture: "arm64" },
    }).as("filteredServersSearch");

    E2EEvent.visitURL("/servers");
    E2EEvent.waitForListingLoaded("servers_table");

    cy.get(`${OPEN_FILTERS_BUTTON} .sc-button__badge`).should("not.exist");
    cy.get(`${OPEN_FILTERS_BUTTON} button`).should("be.visible").click();
    cy.get(FILTER_MODAL).should("be.visible");

    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_tab_processor"]')
      .click();
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_tab_processor"]')
      .should("have.attr", "aria-selected", "true");
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_enum_architecture_arm64"]')
      .check();
    cy.get(FILTER_MODAL)
      .find('[id="filter_modal_filter_enum_architecture_arm64"]')
      .should("be.checked");

    cy.get(FILTER_MODAL).find(APPLY_FILTERS_BUTTON).click();
    cy.get(FILTER_MODAL).should("not.exist");

    cy.location("search").should((search) => {
      expect(new URLSearchParams(search).getAll("architecture")).to.deep.equal([
        "arm64",
      ]);
    });
    cy.wait("@filteredServersSearch", { timeout: API_WAIT_MS })
      .its("response.statusCode")
      .should("eq", 200);
    E2EEvent.waitForListingLoaded("servers_table");
    cy.get(`${OPEN_FILTERS_BUTTON} .sc-button__badge`).should("have.text", "1");

    cy.get(CLEAR_FILTERS_BUTTON).click();

    cy.location("search").should((search) => {
      expect(new URLSearchParams(search).has("architecture")).to.equal(false);
    });
    cy.get(`${OPEN_FILTERS_BUTTON} .sc-button__badge`).should("not.exist");
    cy.get(CLEAR_FILTERS_BUTTON).should("not.exist");
  });
});
