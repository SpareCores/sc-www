import { bypassClerkBotProtection } from "./clerk-testing";
import { E2EEvent } from "./generics";

export const SERVER_COMPARE_URL =
  "/servers/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D";

const PLACEHOLDER_AVATAR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const DATABASES_FILTERED = "/databases?vendor=aws&vcpus_min=2&vcpus_max=2";
const SERVERS_FILTERED = "/servers?vendor=hcloud&gpu_min=1&gpu_memory_min=1";
const SERVER_DETAILS = "/server/gcp/t2d-standard-1";
const DATABASE_DETAILS = "/database/gcp/db-c4a-highmem-48";

function waitForClerk(): void {
  cy.window({ timeout: 30000 }).should((win) => {
    expect(win).to.have.property("Clerk");
    expect((win as Window & { Clerk: { loaded: boolean } }).Clerk.loaded).to.eq(
      true,
    );
  });
}

function fillRegisterDetails(email: string, password: string): void {
  cy.get('input[name="firstName"]').clear().type("Test");
  cy.get('input[name="lastName"]').clear().type("User");
  cy.get('input[name="emailAddress"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('.auth-modal__form button[type="submit"]')
    .first()
    .should("not.be.disabled")
    .click();
}

function expectRegisterStep(title: string): void {
  cy.get(".auth-modal__title", { timeout: 30000 }).should(($title) => {
    const text = $title.text().replace(/\s+/g, " ").trim();
    const error = Cypress.$(".auth-modal__error").text().trim();
    expect(text, error || "register step").to.eq(title);
  });
}

function registerClerkTestUser(email: string, password: string): void {
  bypassClerkBotProtection();
  E2EEvent.visitURL("/", 2000);
  waitForClerk();
  openGuestAuthButton("Register");
  cy.get(".auth-modal__title").should("contain.text", "Create your account");
  fillRegisterDetails(email, password);
  expectRegisterStep("One last step");
  cy.get('input[name="legalAccepted"]').check({ force: true });
  cy.contains("button", "Continue").should("not.be.disabled").click();
  expectRegisterStep("Verify your email");
  cy.get('input[name="verificationCode"]').clear().type("424242");
  cy.contains("button", "Verify email").should("not.be.disabled").click();
  cy.get(".auth-modal", { timeout: 30000 }).should("not.exist");
  cy.get("#auth_button", { timeout: 30000 }).should("be.visible");
}

function ensureVisualUserSession(email: string, password: string): void {
  cy.session(["auth-visual-clerk-test", email], () => {
    registerClerkTestUser(email, password);
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

function prepareLandingChrome(): void {
  E2EEvent.prepareHeaderForScreenshot();
  cy.get("#slot-machine").invoke("css", "display", "none");
  cy.get("#resource-tracker-video").invoke("css", "display", "none");
}

function prepareServerDetailsChrome(): void {
  E2EEvent.prepareHeaderForScreenshot();
  E2EEvent.hideObservedAtForScreenshot();
  cy.get("#availability").invoke("css", "display", "none");
  E2EEvent.hideServerCardPriceForScreenshot();
  cy.get(".price-sections-to-hide-for-test").invoke("css", "display", "none");
  cy.get(".summarize-fab-to-hide-for-test").invoke("css", "display", "none");
  cy.get("#similar_servers").invoke("css", "display", "none");
  cy.get(".workload-profile-radar-chart-to-hide-for-test").invoke(
    "css",
    "display",
    "none",
  );
  E2EEvent.hideCommentsForScreenshot();
  E2EEvent.hideWorkloadProfileChartsForScreenshot();
}

function prepareDatabaseDetailsChrome(): void {
  E2EEvent.prepareHeaderForScreenshot();
  cy.get("#availability").invoke("css", "display", "none");
  E2EEvent.hideDatabaseCardPriceForScreenshot();
}

function prepareServerCompareChrome(): void {
  E2EEvent.prepareHeaderForScreenshot();
  E2EEvent.hideCompareScrollbarsForScreenshot();
  cy.get(".rows-to-hide-for-test").invoke("css", "display", "none");
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

function openGuestAuthButton(label: "Register" | "Log in"): void {
  cy.get("body").then(($body) => {
    const match = $body.find("button").filter((_, el) => {
      const text = (el.textContent || "").trim();
      return text === label && Cypress.$(el).is(":visible");
    });

    if (match.length) {
      cy.wrap(match.first()).click();
      return;
    }

    cy.get("#menu_button").should("be.visible").click();
    cy.get("#menu_options").should("be.visible");
    cy.contains("#menu_options button", label).should("be.visible").click();
  });
}

function snap(name: string, suffix: string): void {
  cy.compareSnapshot(`${name}${suffix}`);
}

export function registerAuthVisualSuites(suffix: string): void {
  describe("Auth visual — guest modals", () => {
    it("compares sign-in modal", () => {
      E2EEvent.visitURL("/", 2000);
      openGuestAuthButton("Log in");
      cy.get(".auth-modal__title").should(
        "contain.text",
        "Sign in to Spare Cores",
      );
      prepareLandingChrome();
      snap("auth-sign-in-modal", suffix);
    });

    it("compares default registration subtitle", () => {
      E2EEvent.visitURL("/", 2000);
      openGuestAuthButton("Register");
      cy.get(".auth-modal__title").should(
        "contain.text",
        "Create your account",
      );
      cy.get(".auth-modal__subtitle").should(
        "contain.text",
        "Welcome! Please fill in the details to get started.",
      );
      prepareLandingChrome();
      snap("auth-register-default-subtitle", suffix);
    });

    it("compares feature registration subtitle", () => {
      E2EEvent.visitURL("/servers", 4000);
      cy.get("sc-bookmark-button button.bookmark-button--locked")
        .first()
        .should("be.visible")
        .click();
      cy.get(".auth-modal__title").should(
        "contain.text",
        "Create your account",
      );
      cy.get(".auth-modal__subtitle").should(
        "contain.text",
        "This feature needs a free registration!",
      );
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("servers_table");
      snap("auth-register-feature-subtitle", suffix);
    });

    it("compares registration consent step", () => {
      bypassClerkBotProtection();
      const runId = Date.now();
      const email = `sc-www+clerk_test+consent+${runId}@example.com`;
      const password = `ScWwwE2e!${runId}`;

      E2EEvent.visitURL("/", 2000);
      waitForClerk();
      openGuestAuthButton("Register");
      fillRegisterDetails(email, password);
      expectRegisterStep("One last step");
      prepareLandingChrome();
      snap("auth-register-consent", suffix);
      cy.task("deleteClerkUserByEmail", email, { timeout: 20000 });
    });

    it("compares registration verify step", () => {
      bypassClerkBotProtection();
      const runId = Date.now();
      const email = `sc-www+clerk_test+verify+${runId}@example.com`;
      const password = `ScWwwE2e!${runId}`;

      E2EEvent.visitURL("/", 2000);
      waitForClerk();
      openGuestAuthButton("Register");
      fillRegisterDetails(email, password);
      expectRegisterStep("One last step");
      cy.get('input[name="legalAccepted"]').check({ force: true });
      cy.contains("button", "Continue").should("not.be.disabled").click();
      expectRegisterStep("Verify your email");
      prepareLandingChrome();
      snap("auth-register-verify", suffix);
      cy.task("deleteClerkUserByEmail", email, { timeout: 20000 });
    });
  });

  describe("Auth visual — authenticated", () => {
    let visualEmail: string | undefined;
    let visualPassword: string | undefined;

    before(() => {
      const runId = Date.now();
      visualEmail = `sc-www+clerk_test+visual${suffix || ""}+${runId}@example.com`;
      visualPassword = `ScWwwE2e!${runId}`;
      ensureVisualUserSession(visualEmail, visualPassword);
    });

    beforeEach(() => {
      expect(visualEmail, "visualEmail").to.be.a("string").and.not.be.empty;
      expect(visualPassword, "visualPassword").to.be.a("string").and.not.be
        .empty;
      ensureVisualUserSession(visualEmail!, visualPassword!);
    });

    after(() => {
      if (!visualEmail) {
        return;
      }
      const email = visualEmail;
      visualEmail = undefined;
      visualPassword = undefined;
      cy.task("deleteClerkUserByEmail", email, { timeout: 20000 });
    });

    it("compares signed-in header", () => {
      E2EEvent.visitURL("/", 2000);
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snap("auth-signed-in-header", suffix);
    });

    it("compares signed-in account menu", () => {
      E2EEvent.visitURL("/", 2000);
      cy.get("#auth_button").should("be.visible").click();
      cy.get("#auth_options").should("be.visible");
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snap("auth-signed-in-account-menu", suffix);
    });

    it("compares edit profile", () => {
      E2EEvent.visitURL("/", 2000);
      cy.get("#auth_button").should("be.visible").click();
      cy.get("#auth_options").should("be.visible");
      cy.contains("#auth_options button", "Edit Profile").click();
      cy.get(".cl-userProfile-root, .cl-modalContent, .cl-card", {
        timeout: 20000,
      }).should("be.visible");
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snap("auth-edit-profile", suffix);
    });

    it("compares unlocked server listing bookmarks", () => {
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
      snap("auth-unlocked-server-listing-bookmarks", suffix);
    });

    it("compares unlocked database listing bookmarks", () => {
      E2EEvent.visitURL("/databases", 4000);
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
      E2EEvent.hideListingTableResultsForScreenshot("databases_table");
      snap("auth-unlocked-database-listing-bookmarks", suffix);
    });

    it("compares unlocked server details bookmark", () => {
      E2EEvent.visitURL(SERVER_DETAILS, 4000);
      cy.get(
        "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)",
      )
        .first()
        .should("be.visible");
      stabilizeSignedInHeader();
      prepareServerDetailsChrome();
      snap("auth-unlocked-server-details-bookmark", suffix);
    });

    it("compares unlocked database details bookmark", () => {
      E2EEvent.visitURL(DATABASE_DETAILS, 4000);
      cy.get(
        "sc-bookmark-button button.bookmark-button:not(.bookmark-button--locked)",
      )
        .first()
        .should("be.visible");
      stabilizeSignedInHeader();
      prepareDatabaseDetailsChrome();
      snap("auth-unlocked-database-details-bookmark", suffix);
    });

    it("compares empty bookmarks page", () => {
      clearAllBookmarks();
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      snap("auth-bookmarks-empty", suffix);
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
      snap("auth-bookmarks-populated", suffix);
    });

    it("compares save-search modal on servers", () => {
      clearAllBookmarks();
      E2EEvent.visitURL(SERVERS_FILTERED, 4000);
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
      snap("auth-save-search-servers-modal", suffix);
    });

    it("compares save-search modal on databases", () => {
      clearAllBookmarks();
      E2EEvent.visitURL(DATABASES_FILTERED, 4000);
      cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
        .should("be.visible")
        .and("not.be.disabled")
        .click();
      cy.get("#database-listing-save-search-modal")
        .should("not.have.class", "hidden")
        .and("be.visible");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("databases_table");
      snap("auth-save-search-databases-modal", suffix);
    });

    it("compares save-comparison modal", () => {
      clearAllBookmarks();
      E2EEvent.visitURL(SERVER_COMPARE_URL, 4000);
      cy.get("button.page-header__bookmark:not(.page-header__bookmark--locked)")
        .should("be.visible")
        .and("not.be.disabled")
        .click();
      cy.get("#server-compare-save-modal")
        .should("not.have.class", "hidden")
        .and("be.visible");
      stabilizeSignedInHeader();
      prepareServerCompareChrome();
      snap("auth-save-comparison-modal", suffix);
    });

    it("compares save-assessment modal", () => {
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
      snap("auth-save-assessment-modal", suffix);
    });

    it("compares signed-out header after sign-out", () => {
      E2EEvent.visitURL("/", 2000);
      cy.get("#auth_button").should("be.visible").click();
      cy.get("#auth_options").should("be.visible");
      cy.contains("#auth_options button", "Sign Out").click();
      cy.get("#auth_button").should("not.exist");
      prepareLandingChrome();
      snap("auth-signed-out-header", suffix);
    });
  });
}
