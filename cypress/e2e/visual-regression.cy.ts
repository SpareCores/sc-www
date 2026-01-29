import { E2EEvent } from "../support/generics";

describe("Visual regression tests", () => {
  it("should compare screenshot of the landing page", () => {
    E2EEvent.visitURL("/");
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");
    // Hide slot machine for screenshot consistency
    cy.get("#slot-machine").invoke("css", "display", "none");
    // Hide resource tracker video for screenshot consistency
    cy.get("#resource-tracker-video").invoke("css", "display", "none");

    cy.compareSnapshot("landing-page");
  });

  it("should compare screenshot of servers list (Hetzner / GPU >=1)", () => {
    E2EEvent.visitURL("/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1");
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");

    cy.compareSnapshot("servers-hcloud-gpu1");
  });

  it("should compare screenshot of design page", () => {
    E2EEvent.visitURL("/design");
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");

    cy.compareSnapshot("design-page");
  });

  it("should compare screenshot of server details page", () => {
    E2EEvent.visitURL("/server/gcp/t2d-standard-1");
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");
    // Hide availability section for screenshot consistency
    cy.get("#availability").invoke("css", "display", "none");
    // Hide dynamic elements for screenshot consistency
    cy.get("#average-price-per-region").invoke("css", "display", "none");
    cy.get("#prices-per-zone").invoke("css", "display", "none");
    cy.get("#lowest-prices").invoke("css", "display", "none");
    // Hide similar servers section for screenshot consistency
    cy.get("#similar_servers").invoke("css", "display", "none");
    // Hide comments section for screenshot consistency
    cy.get(".giscus").invoke("css", "display", "none");

    cy.compareSnapshot("server-details-gcp-t2d-standard-1");
  });

  it("should compare screenshot of server comparison page", () => {
    E2EEvent.visitURL(
      "/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D",
    );
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");
    // Hide $core price row for screenshot consistency
    cy.get("#score-row").invoke("css", "display", "none");
    // Hide best spot price row for screenshot consistency
    cy.get("#best-spot-price-row").invoke("css", "display", "none");
    // Hide best on-demand price row for screenshot consistency
    cy.get("#best-on-demand-price-row").invoke("css", "display", "none");

    cy.compareSnapshot("server-comparison-aws-a1-medium-c6gd-medium");
  });
});
