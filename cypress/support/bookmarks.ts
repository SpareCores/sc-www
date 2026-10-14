import { E2EEvent } from "./generics";

export const SERVER_COMPARE_URL =
  "/servers/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D";
export const SERVERS_FILTERED_URL =
  "/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1";
export const DATABASES_FILTERED_URL =
  "/databases?vendor=aws&vcpus_min=2&vcpus_max=2";

export const UNLOCKED_BOOKMARK_BUTTON =
  "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)";

export function openBookmarksPage(): void {
  E2EEvent.visitURL("/bookmarks", 4000);
  cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");
}

export function loadAdvisorExample(): void {
  E2EEvent.visitURL("/advisor", 4000);
  cy.get("#advisor_example_button")
    .should("be.visible")
    .click({ force: true });
}

export function openPageHeaderSaveModal(modalId: string): void {
  cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
    .should("be.visible")
    .and("not.be.disabled")
    .click();
  cy.get(`#${modalId}`).should("not.have.class", "hidden").and("be.visible");
}
