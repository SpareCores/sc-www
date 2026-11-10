import { SERVER_COMPARE_INSTANCES } from "../../support/bookmarks";
import { E2EEvent } from "../../support/generics";
import {
  compareVisualSnapshot,
  registerVisualSuites,
} from "../../support/visual";

describe("Visual regression tests", () => {
  registerVisualSuites("desktop");

  it("should compare screenshot of embedded server widget", () => {
    E2EEvent.visitURL("/embed/server/gcp/t2d-standard-1/geek_single");

    cy.get("sc-server-charts canvas").should("be.visible");
    E2EEvent.waitForCharts("sc-server-charts");
    E2EEvent.loadImagesForScreenshot(".sc-chart-embed img");

    compareVisualSnapshot(
      "embedded-server-widget-gcp-t2d-standard-1-geek-single",
      "desktop",
    );
  });

  it("should compare screenshot of embedded compare widget", () => {
    E2EEvent.visitURL(
      `/embed/compare/generic?instances=${SERVER_COMPARE_INSTANCES}`,
    );

    E2EEvent.waitForServerCompare();
    cy.get(
      "sc-server-compare-charts table#main-table thead th[id^='main-table-th-']",
    ).should("have.length", 2);
    cy.get("sc-server-compare-charts table#main-table img").should(
      "have.length",
      2,
    );

    cy.get(".rows-to-hide-for-test").invoke("css", "display", "none");

    E2EEvent.loadImagesForScreenshot(".sc-chart-embed img");

    compareVisualSnapshot(
      "embedded-compare-widget-aws-a1-medium-c6gd-medium-generic",
      "desktop",
    );
  });
});
