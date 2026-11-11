import { collectionListUrl } from "./collections-mock";
import { E2EEvent } from "./generics";

export const SERVER_COMPARE_INSTANCES =
  "W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D";
export const SERVER_COMPARE_URL = `/servers/compare?instances=${SERVER_COMPARE_INSTANCES}`;
export const SERVERS_FILTERED_URL =
  "/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1";
export const DATABASES_FILTERED_URL =
  "/databases?vendor=aws&vcpus_min=2&vcpus_max=2";

export const UNLOCKED_BOOKMARK_BUTTON =
  "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)";

export function openBookmarksPage(): void {
  cy.intercept("GET", collectionListUrl()).as("bookmarksCollectionList");
  E2EEvent.visitURL("/bookmarks");
  cy.get("#bookmarks-name-search", { timeout: 20000 }).should("be.visible");
  cy.wait("@bookmarksCollectionList");
  cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");
}

export function loadAdvisorExample(): void {
  E2EEvent.visitURL("/advisor");
  cy.get("#advisor_example_button").should("be.visible").click({ force: true });
  cy.get(
    "#advisor_results_table tbody tr:not(.advisor-empty-state-row)",
  ).should("have.length.greaterThan", 0);
  cy.get(".advisor-table-loading-overlay").should("not.exist");
}

export function openPageHeaderSaveModal(modalId: string): void {
  cy.scrollTo(0, 0, { ensureScrollable: false });
  cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
    .should("be.visible")
    .and("not.be.disabled")
    .click({ scrollBehavior: false });
  cy.get(`#${modalId}`).should("not.have.class", "hidden").and("be.visible");
}
