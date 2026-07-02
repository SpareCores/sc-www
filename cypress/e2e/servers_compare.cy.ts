import { E2EEvent } from "../support/generics";

const BENCHMARKS_COUNT_WITHOUT_STRESSNG = 10;
const BENCHMARKS_COUNT = 12;
const COMPARE_PRICE_URL =
  "/compare?instances=W3siZGlzcGxheV9uYW1lIjoidDJhLXN0YW5kYXJkLTEiLCJ2ZW5kb3IiOiJnY3AiLCJzZXJ2ZXIiOiJ0MmEtc3RhbmRhcmQtMSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiYzdnLm1lZGl1bSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6ImM3Zy5tZWRpdW0iLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D";
const COMPARE_36_VCPU_URL =
  "/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYzVuLjl4bGFyZ2UifSx7InZlbmRvciI6ImF3cyIsInNlcnZlciI6ImQyLjh4bGFyZ2UifV0%3D";

function showCompareTooltip() {
  cy.get(
    '#main-table tr.rows-to-hide-for-test [data-cy="compare-score-tooltip-trigger"]',
  ).then(($icon) => {
    cy.window().then((win) => {
      $icon[0].dispatchEvent(
        new win.MouseEvent("mouseenter", {
          bubbles: false,
          cancelable: true,
          view: win,
        }),
      );
    });
  });
}

describe("Server Compare", () => {
  it("Server with price 1 vCPU", () => {
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisibleAndNotEmpty(`[id="main-table"]`);

    E2EEvent.countElements(`[id="main-table"]`, `[id^="main-table-th"]`, 2);

    E2EEvent.countElements(
      `[id="main-table"]`,
      `[id^="benchmark_line"]`,
      BENCHMARKS_COUNT_WITHOUT_STRESSNG,
    );
  });

  it("Server with price 36 vCPU", () => {
    E2EEvent.visitURL(COMPARE_36_VCPU_URL, 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisibleAndNotEmpty(`[id="main-table"]`);

    E2EEvent.countElements(`[id="main-table"]`, `[id^="main-table-th"]`, 2);

    E2EEvent.countElements(
      `[id="main-table"]`,
      `[id^="benchmark_line"]`,
      BENCHMARKS_COUNT,
    );
  });

  it("shows both compared server headers in the initial viewport", () => {
    cy.viewport(1280, 900);
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    cy.get("#table_holder").then(($tableHolder) => {
      const holderRect = $tableHolder[0].getBoundingClientRect();

      cy.get('[id^="main-table-th-"]').each(($headerCell) => {
        const headerRect = $headerCell[0].getBoundingClientRect();

        expect(headerRect.left).to.be.greaterThan(holderRect.left);
        expect(headerRect.right).to.be.lessThan(holderRect.right + 1);
      });
    });
  });

  it("keeps compare header server names on one line", () => {
    cy.viewport(1280, 900);
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    cy.get('#server-compare-table-header a[target="_blank"]').each(($link) => {
      expect($link).to.have.css("white-space", "nowrap");
      expect($link[0].getClientRects().length).to.equal(1);
    });
  });

  it("keeps sticky compare header server names on one line", () => {
    cy.viewport(1280, 900);
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    cy.scrollTo(0, 500);

    cy.get(".fixed_thead").should("exist");
    cy.get('.fixed_thead a[target="_blank"]').each(($link) => {
      expect($link).to.have.css("white-space", "nowrap");
      expect($link[0].getClientRects().length).to.equal(1);
    });
  });

  it("dismisses the compare tooltip when the table scrolls on smaller screens", () => {
    cy.viewport(800, 900);
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    showCompareTooltip();

    cy.get("#tooltipcompareDefault")
      .should("have.css", "display", "block")
      .and("have.css", "opacity", "1")
      .and("contain.text", "Performance benchmark score");

    cy.get("#table_holder").then(($tableHolder) => {
      $tableHolder[0].dispatchEvent(new Event("scroll"));
    });

    cy.get("#tooltipcompareDefault")
      .should("have.css", "display", "none")
      .and("have.css", "opacity", "0");
  });

  it("dismisses the compare tooltip when the page scrolls", () => {
    E2EEvent.visitURL(COMPARE_PRICE_URL, 4000);

    showCompareTooltip();

    cy.get("#tooltipcompareDefault")
      .should("have.css", "display", "block")
      .and("have.css", "opacity", "1");

    cy.scrollTo(0, 500);

    cy.get("#tooltipcompareDefault")
      .should("have.css", "display", "none")
      .and("have.css", "opacity", "0");
  });
});
