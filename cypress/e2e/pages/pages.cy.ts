import { SERVER_COMPARE_URL } from "../../support/bookmarks";
import { E2EEvent } from "../../support/generics";

const hasTableRows = (selector: string) => () =>
  cy.get(`${selector} tbody tr`).should("have.length.at.least", 1);

const PAGES: { url: string; check: () => void }[] = [
  { url: "/", check: () => E2EEvent.isVisible("#slot-machine") },
  {
    url: "/servers",
    check: () => E2EEvent.waitForListingResults("servers_table"),
  },
  { url: "/advisor", check: () => E2EEvent.isVisible("#serverSearchBar") },
  { url: "/server_prices", check: hasTableRows("#server_prices_table") },
  {
    url: "/vendors",
    check: () => cy.contains("h1", "Supported Vendors").should("be.visible"),
  },
  {
    url: "/regions",
    check: () => cy.contains("h1", "Regions").should("be.visible"),
  },
  {
    url: "/articles",
    check: () =>
      cy
        .get(".articles_holder sc-article-card")
        .should("have.length.at.least", 1),
  },
  { url: "/design", check: () => E2EEvent.isVisible(".design-grid") },
  {
    url: "/article/berlin-buzzwords-2024",
    check: () => E2EEvent.isVisibleAndNotEmpty("sc-article h1"),
  },
  {
    url: "/server/gcp/t2d-standard-1",
    check: () => E2EEvent.waitForServerDetails(),
  },
  {
    url: SERVER_COMPARE_URL,
    check: () =>
      cy.get('[id^="main-table-th-"]').should("have.length.at.least", 1),
  },
  { url: "/legal", check: hasTableRows("table.sc-table") },
  {
    url: "/legal/terms-of-service",
    check: () => E2EEvent.isVisibleAndNotEmpty(".sc-prose"),
  },
  {
    url: "/legal/privacy-policy",
    check: () => E2EEvent.isVisibleAndNotEmpty(".sc-prose"),
  },
  {
    url: "/navigator/benchmark-coverage",
    check: hasTableRows("table.sc-table"),
  },
  {
    url: "/navigator/benchmark-workloads",
    check: () => E2EEvent.isVisibleAndNotEmpty(".list_holder"),
  },
  {
    url: "/advisor?workload_id=stress_ng:bestn&workload_config={}&minimum_memory=0.5",
    check: () => {
      E2EEvent.isVisibleAndNotEmpty("#advisor_results_table");
      cy.get(
        "#advisor_results_table tbody tr:not(.advisor-empty-state-row)",
      ).should("have.length.at.least", 1);
    },
  },
];

describe("Visit main pages", () => {
  PAGES.forEach(({ url, check }) => {
    it(`loads ${url}`, () => {
      E2EEvent.visitURL(url);
      check();
    });
  });
});
