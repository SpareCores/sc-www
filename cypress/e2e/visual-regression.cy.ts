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
    // Hide price related sections for screenshot consistency
    cy.get(".price-sections-to-hide-for-test").invoke("css", "display", "none");
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

    // Force isTableOutsideViewport to always set to false
    cy.window().then((win: any) => {
      cy.get("app-server-compare").then(($el) => {
        if (win.ng?.getComponent) {
          const component = win.ng.getComponent($el[0]);
          component.isTableOutsideViewport = false;

          Object.defineProperty(component, "isTableOutsideViewport", {
            get: () => false,
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
      style.innerHTML = `.fixed_thead { 
        display: none !important; 
        visibility: hidden !important; 
        pointer-events: none !important;
        opacity: 0 !important;
        }`;
      doc.head.appendChild(style);
    });
    // Fix header position for screenshot consistency
    cy.get("header").invoke("css", "position", "static");
    // Hide price rows for screenshot consistency
    cy.get(".rows-to-hide-for-test").invoke("css", "display", "none");
    cy.compareSnapshot("server-comparison-aws-a1-medium-c6gd-medium");
  });
});
