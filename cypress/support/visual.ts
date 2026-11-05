import { SERVER_COMPARE_URL } from "./bookmarks";
import { E2EEvent, VisualSizePrefix, visualSnapshotName } from "./generics";

export function compareVisualSnapshot(
  name: string,
  prefix: VisualSizePrefix,
): void {
  cy.compareSnapshot({
    name: visualSnapshotName(name, prefix),
    exactName: true,
  });
}

function waitForLandingPage(): void {
  cy.contains("#hero", "Don't gamble with your cloud costs.").should(
    "be.visible",
  );
  cy.get(".articles_holder sc-article-card").should("have.length.at.least", 1);
  cy.get("pre.language-python .token").should("exist");
}

function waitForFilteredListingPage(tableId: string, vendor: string): void {
  cy.get("sc-page-header h1").should("be.visible");
  E2EEvent.waitForListingLoaded(tableId);
  cy.get(`#filter_enum_vendor_${vendor}`)
    .should("be.checked")
    .next()
    .should(($label) => {
      expect($label.text().trim()).not.to.eq(vendor);
    });
}

function waitForServerDetailsPage(): void {
  cy.get("#server_base_info_box").should("be.visible");
  E2EEvent.waitForServerDetails();
  cy.get("#details_more_button").should("be.visible");
  cy.get("#processor_more_button").should("be.visible");
  cy.get("#lstopo .lstopo-inline-svg svg").should("exist");
  cy.get(".server-description-card").should("be.visible");
  cy.get("table.items_table_similar.similar_family_table tbody tr").should(
    "have.length.at.least",
    1,
  );
}

function waitForDatabaseDetailsPage(): void {
  cy.get("#database_base_info_box").should("be.visible");
  cy.get("#details tbody tr").should("have.length.at.least", 1);
  cy.get("#features_more_button").should("be.visible");
  cy.get("#security_more_button").should("be.visible");
  cy.get("#pgbench_canvas").should("exist");
  cy.get("#underlying_server_pgbench_canvas").should("exist");
}

function prepareLandingPage(): void {
  E2EEvent.visitURL("/");
  waitForLandingPage();

  // Prepare header position for a consistent visual regression snapshot
  E2EEvent.prepareHeaderForScreenshot();

  // Hide slot machine for screenshot consistency
  cy.get("#slot-machine").invoke("css", "display", "none");

  // Hide resource tracker video for screenshot consistency
  cy.get("#resource-tracker-video").invoke("css", "display", "none");

  E2EEvent.loadImagesForScreenshot(".articles_holder img");
}

export function registerMobileMenuSuite(prefix: VisualSizePrefix): void {
  it("should compare screenshot of the landing page with the mobile menu open", () => {
    prepareLandingPage();
    E2EEvent.openMobileMenuForScreenshot();
    compareVisualSnapshot("landing-page-mobile-menu-open", prefix);
  });
}

export function registerVisualSuites(prefix: VisualSizePrefix): void {
  const compare = (name: string) => compareVisualSnapshot(name, prefix);

  it("should compare screenshot of the landing page", () => {
    prepareLandingPage();
    compare("landing-page");
  });

  it("should compare screenshot of servers list (Hetzner / GPU >=1)", () => {
    E2EEvent.visitURL("/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1");
    waitForFilteredListingPage("servers_table", "hcloud");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide table results for screenshot consistency
    E2EEvent.hideListingTableResultsForScreenshot("servers_table");

    compare("servers-hcloud-gpu1");
  });

  it("should compare screenshot of databases list (AWS / 2 vCPUs)", () => {
    E2EEvent.visitURL("/databases?vendor=aws&vcpus_min=2&vcpus_max=2");
    waitForFilteredListingPage("databases_table", "aws");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide table results for screenshot consistency
    E2EEvent.hideListingTableResultsForScreenshot("databases_table");

    compare("databases-aws-vcpus2");
  });

  it("should compare screenshot of design page", () => {
    E2EEvent.visitURL("/design");
    cy.get("sc-downloadable-logo-collection").should("have.length.at.least", 1);

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    E2EEvent.loadImagesForScreenshot(".design-grid img");

    compare("design-page");
  });

  it("should compare screenshot of server details page", () => {
    E2EEvent.visitURL("/server/gcp/t2d-standard-1");
    waitForServerDetailsPage();

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide "Observed at" row in Server Metadata for screenshot consistency
    E2EEvent.hideObservedAtForScreenshot();

    // Hide availability section for screenshot consistency
    cy.get("#availability").invoke("css", "display", "none");

    E2EEvent.hideServerCardPriceForScreenshot();

    // Hide price related sections for screenshot consistency
    cy.get(".price-sections-to-hide-for-test").invoke("css", "display", "none");
    cy.get(".summarize-fab-to-hide-for-test").invoke("css", "display", "none");

    // Hide similar servers section for screenshot consistency
    cy.get("#similar_servers").invoke("css", "display", "none");

    // Hide workload profile spider chart for screenshot consistency
    cy.get(".workload-profile-radar-chart-to-hide-for-test").invoke(
      "css",
      "display",
      "none",
    );

    // Hide comments section for screenshot consistency
    E2EEvent.hideCommentsForScreenshot();

    E2EEvent.hideWorkloadProfileChartsForScreenshot();

    E2EEvent.loadImagesForScreenshot("#server_base_info_box .vendor-logo img");
    E2EEvent.waitForCharts(
      "sc-server-charts > :not(sc-workload-profile-panel)",
    );

    compare("server-details-gcp-t2d-standard-1");
  });

  it("should compare screenshot of database details page", () => {
    E2EEvent.visitURL("/database/gcp/db-c4a-highmem-48");
    waitForDatabaseDetailsPage();

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide availability section for screenshot consistency
    cy.get("#availability").invoke("css", "display", "none");

    E2EEvent.hideDatabaseCardPriceForScreenshot();

    E2EEvent.loadImagesForScreenshot("#database_base_info_box img");
    E2EEvent.waitForCharts("sc-benchmark-line-chart");

    compare("database-details-gcp-db-c4a-highmem-48");
  });

  it("should compare screenshot of server comparison page", () => {
    E2EEvent.visitURL(SERVER_COMPARE_URL);
    cy.get("sc-server-compare-charts table#main-table tbody tr").should(
      "have.length.at.least",
      1,
    );

    // Hide the dynamic table header
    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.textContent = `.fixed_thead {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
        }`;
      doc.head.appendChild(style);
    });

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideCompareScrollbarsForScreenshot();

    // Hide price rows for screenshot consistency
    cy.get(".rows-to-hide-for-test").invoke("css", "display", "none");

    E2EEvent.hideWorkloadProfileChartsForScreenshot();

    E2EEvent.loadImagesForScreenshot(
      "sc-server-compare-charts table#main-table img",
    );
    E2EEvent.waitForCharts(
      "sc-server-compare-charts .compare-chart-content > :not(sc-workload-profile-panel)",
    );

    compare("server-comparison-aws-a1-medium-c6gd-medium");
  });

  it("should compare screenshot of advisor page", () => {
    E2EEvent.visitURL("/advisor");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideBaselineServerCaretForScreenshot();

    cy.contains("No matches yet").should("be.visible");
    cy.get("#serverSearchBar").should("be.visible");

    compare("advisor-page");
  });

  it("should compare screenshot of legal documents page", () => {
    E2EEvent.visitURL("/legal");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // We check that the table body contains at least one row before snapping.
    cy.get("table.sc-table tbody tr").should("have.length.at.least", 1);

    compare("legal-documents-list");
  });

  it("should compare screenshot of partners page", () => {
    E2EEvent.visitURL("/about/partners");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    cy.contains("Strategic & Ecosystem Partners").should("be.visible");
    cy.get(".partner-logos").should("have.length.at.least", 1);
    E2EEvent.loadImagesForScreenshot(".partner-logo-image");

    compare("partners-page");
  });
}
