import { setupClerkTestingToken } from "@clerk/testing/cypress";
import { E2EEvent } from "../support/generics";

const COMPARE_URL =
  "/servers/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D";

const PLACEHOLDER_AVATAR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function visualUserCredentials(): { email: string; password: string } {
  const email = Cypress.env("E2E_CLERK_USER_EMAIL") as string | undefined;
  const password = Cypress.env("E2E_CLERK_USER_PASSWORD") as string | undefined;
  expect(email, "E2E_CLERK_USER_EMAIL").to.be.a("string").and.not.be.empty;
  expect(password, "E2E_CLERK_USER_PASSWORD").to.be.a("string").and.not.be
    .empty;
  return { email: email!, password: password! };
}

function signInVisualUser(): void {
  const { email, password } = visualUserCredentials();

  cy.session(["auth-visual", email], () => {
    setupClerkTestingToken();
    E2EEvent.visitURL("/", 2000);
    cy.clerkSignIn({
      strategy: "password",
      identifier: email,
      password,
    });
    cy.get("#auth_button", { timeout: 20000 }).should("be.visible");
  });
}

function stabilizeSignedInHeader(): void {
  cy.get("#auth_button").should("be.visible");
  cy.get("body").then(($body) => {
    const avatar = $body.find("#auth_button img");
    if (avatar.length) {
      cy.wrap(avatar).invoke("attr", "src", PLACEHOLDER_AVATAR);
    }
  });
}

function clearAllBookmarks(): void {
  E2EEvent.visitURL("/bookmarks", 4000);
  cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");

  const deleteRemaining = (): void => {
    cy.get("body").then(($body) => {
      if ($body.find('button[aria-label="Delete"]').length === 0) {
        cy.contains("No bookmarks match the current filters.").should(
          "be.visible",
        );
        return;
      }

      cy.get('button[aria-label="Delete"]').first().click();
      cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");
      deleteRemaining();
    });
  };

  deleteRemaining();
}

describe("Auth visual — registration subtitles", () => {
  it("compares default registration subtitle", () => {
    E2EEvent.visitURL("/", 2000);
    cy.contains("button", "Register").click();
    cy.get(".auth-modal__title").should("contain.text", "Create your account");
    cy.get(".auth-modal__subtitle").should(
      "contain.text",
      "Welcome! Please fill in the details to get started.",
    );
    E2EEvent.prepareHeaderForScreenshot();
    cy.compareSnapshot("auth-register-default-subtitle");
  });

  it("compares feature registration subtitle", () => {
    E2EEvent.visitURL("/servers", 4000);
    cy.get("sc-bookmark-button button.bookmark-button--locked")
      .first()
      .should("be.visible")
      .click();
    cy.get(".auth-modal__title").should("contain.text", "Create your account");
    cy.get(".auth-modal__subtitle").should(
      "contain.text",
      "This feature needs a free registration!",
    );
    E2EEvent.prepareHeaderForScreenshot();
    cy.compareSnapshot("auth-register-feature-subtitle");
  });
});

describe("Auth visual — authenticated", () => {
  beforeEach(() => {
    signInVisualUser();
  });

  it("compares signed-in header", () => {
    E2EEvent.visitURL("/", 2000);
    cy.get("#auth_button").should("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    cy.get("#slot-machine").invoke("css", "display", "none");
    cy.get("#resource-tracker-video").invoke("css", "display", "none");
    cy.compareSnapshot("auth-signed-in-header");
  });

  it("compares signed-in account menu", () => {
    E2EEvent.visitURL("/", 2000);
    cy.get("#auth_button").should("be.visible").click();
    cy.get("#auth_options").should("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    cy.get("#slot-machine").invoke("css", "display", "none");
    cy.get("#resource-tracker-video").invoke("css", "display", "none");
    cy.compareSnapshot("auth-signed-in-account-menu");
  });

  it("compares unlocked listing bookmark buttons", () => {
    E2EEvent.visitURL("/servers", 4000);
    cy.get(
      "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)",
    )
      .first()
      .should("be.visible");
    cy.get(
      "button.page-header__bookmark:not(.page-header__bookmark--locked)",
    ).should("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideListingTableResultsForScreenshot("servers_table");
    cy.compareSnapshot("auth-unlocked-bookmark-buttons");
  });

  it("compares empty bookmarks page", () => {
    clearAllBookmarks();
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    cy.compareSnapshot("auth-bookmarks-empty");
  });

  it("compares populated bookmarks page", () => {
    clearAllBookmarks();
    E2EEvent.visitURL("/servers", 4000);
    cy.get(
      "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)",
    )
      .first()
      .should("be.visible")
      .click();
    cy.get("sc-bookmark-button button.bookmark-button--active", {
      timeout: 20000,
    }).should("have.length.at.least", 1);

    E2EEvent.visitURL("/bookmarks", 4000);
    cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");
    cy.get("article.bookmarks-card").should("have.length.at.least", 1);
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    cy.compareSnapshot("auth-bookmarks-populated");
  });

  it("compares save-search modal entry point", () => {
    clearAllBookmarks();
    E2EEvent.visitURL(
      "/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1",
      4000,
    );
    cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
      .should("be.visible")
      .and("not.be.disabled")
      .click();
    cy.get("#server-listing-save-search-modal")
      .should("not.have.class", "hidden")
      .and("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideListingTableResultsForScreenshot("servers_table");
    cy.compareSnapshot("auth-save-search-modal");
  });

  it("compares save-comparison modal entry point", () => {
    clearAllBookmarks();
    E2EEvent.visitURL(COMPARE_URL, 4000);
    cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
      .should("be.visible")
      .and("not.be.disabled")
      .click();
    cy.get("#server-compare-save-modal")
      .should("not.have.class", "hidden")
      .and("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideCompareScrollbarsForScreenshot();
    cy.get(".rows-to-hide-for-test").invoke("css", "display", "none");
    cy.compareSnapshot("auth-save-comparison-modal");
  });

  it("compares save-assessment modal entry point", () => {
    clearAllBookmarks();
    E2EEvent.visitURL("/advisor", 4000);
    cy.get("#advisor_example_button").should("be.visible").click();
    cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
      .should("be.visible")
      .and("not.be.disabled")
      .click();
    cy.get("#advisor-save-modal")
      .should("not.have.class", "hidden")
      .and("be.visible");
    stabilizeSignedInHeader();
    E2EEvent.prepareHeaderForScreenshot();
    E2EEvent.hideBaselineServerCaretForScreenshot();
    cy.compareSnapshot("auth-save-assessment-modal");
  });
});
