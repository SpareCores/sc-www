import { E2EEvent, visualSnapshotName } from "../support/generics";

describe("Visual regression tests (small screen - 800px)", () => {
  beforeEach(() => {
    cy.viewport(800, 900);
  });

  it("should compare screenshot of the landing page", () => {
    E2EEvent.visitURL("/");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide slot machine for screenshot consistency
    cy.get("#slot-machine").invoke("css", "display", "none");

    // Hide resource tracker video for screenshot consistency
    cy.get("#resource-tracker-video").invoke("css", "display", "none");

    cy.compareSnapshot({
      name: visualSnapshotName("landing-page", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of the landing page with the mobile menu open", () => {
    E2EEvent.visitURL("/");

    E2EEvent.prepareHeaderForScreenshot();

    cy.get("#slot-machine").invoke("css", "display", "none");
    cy.get("#resource-tracker-video").invoke("css", "display", "none");

    E2EEvent.openMobileMenuForScreenshot();

    cy.compareSnapshot({
      name: visualSnapshotName("landing-page-mobile-menu-open", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of servers list (Hetzner / GPU >=1)", () => {
    E2EEvent.visitURL("/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide table results for screenshot consistency
    E2EEvent.hideListingTableResultsForScreenshot("servers_table");

    cy.compareSnapshot({
      name: visualSnapshotName("servers-hcloud-gpu1", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of databases list (AWS / 2 vCPUs)", () => {
    E2EEvent.visitURL("/databases?vendor=aws&vcpus_min=2&vcpus_max=2");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide table results for screenshot consistency
    E2EEvent.hideListingTableResultsForScreenshot("databases_table");

    cy.compareSnapshot({
      name: visualSnapshotName("databases-aws-vcpus2", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of design page", () => {
    E2EEvent.visitURL("/design");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    cy.compareSnapshot({
      name: visualSnapshotName("design-page", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of server details page", () => {
    E2EEvent.visitURL("/server/gcp/t2d-standard-1");

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

    cy.compareSnapshot({
      name: visualSnapshotName("server-details-gcp-t2d-standard-1", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of database details page", () => {
    E2EEvent.visitURL("/database/gcp/db-c4a-highmem-48");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // Hide availability section for screenshot consistency
    cy.get("#availability").invoke("css", "display", "none");

    E2EEvent.hideDatabaseCardPriceForScreenshot();

    cy.compareSnapshot({
      name: visualSnapshotName(
        "database-details-gcp-db-c4a-highmem-48",
        "mobile",
      ),
      exactName: true,
    });
  });

  it("should compare screenshot of server comparison page", () => {
    E2EEvent.visitURL(
      "/servers/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D",
    );

    // Force isTableOutsideViewport to always set to false
    cy.window().then((win: any) => {
      cy.get("sc-server-compare").then(($el) => {
        if (win.ng?.getComponent) {
          const component = win.ng.getComponent($el[0]);
          const alwaysFalseSignal = Object.assign(() => false, {
            set: () => {},
            update: () => {},
          });

          Object.defineProperty(component, "isTableOutsideViewport", {
            get: () => alwaysFalseSignal,
            set: () => {},
            configurable: true,
          });

          win.ng.applyChanges(component);
        } else {
          console.warn(
            "Angular debug API not available; skipping table override",
          );
        }
      });
    });

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

    cy.compareSnapshot({
      name: visualSnapshotName(
        "server-comparison-aws-a1-medium-c6gd-medium",
        "mobile",
      ),
      exactName: true,
    });
  });

  it("should compare screenshot of advisor page", () => {
    E2EEvent.visitURL("/advisor", 4000);

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideBaselineServerCaretForScreenshot();

    cy.contains("No matches yet").should("be.visible");
    cy.get("#serverSearchBar").should("be.visible");

    cy.compareSnapshot({
      name: visualSnapshotName("advisor-page", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of legal documents page", () => {
    E2EEvent.visitURL("/legal");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    // We check that the table body contains at least one row before snapping.
    cy.get("table.items_table tbody tr").should("have.length.at.least", 1);

    // Capture the visual snapshot
    cy.compareSnapshot({
      name: visualSnapshotName("legal-documents-list", "mobile"),
      exactName: true,
    });
  });

  it("should compare screenshot of partners page", () => {
    E2EEvent.visitURL("/about/partners");

    // Prepare header position for a consistent visual regression snapshot
    E2EEvent.prepareHeaderForScreenshot();

    cy.contains("Strategic & Ecosystem Partners").should("be.visible");
    cy.get(".partner-logos").should("have.length.at.least", 1);
    E2EEvent.loadImagesForScreenshot(".partner-logo-image");

    cy.compareSnapshot({
      name: visualSnapshotName("partners-page", "mobile"),
      exactName: true,
    });
  });
});
