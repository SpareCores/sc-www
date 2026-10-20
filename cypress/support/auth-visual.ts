import {
  DATABASES_FILTERED_URL,
  SERVER_COMPARE_URL,
  SERVERS_FILTERED_URL,
  UNLOCKED_BOOKMARK_BUTTON,
  loadAdvisorExample,
  openBookmarksPage,
  openPageHeaderSaveModal,
} from "./bookmarks";
import {
  acceptRegisterConsent,
  clerkTestEmail,
  deleteClerkTestUser,
  expectAuthModalStep,
  fillRegisterDetails,
  openGuestAuthButton,
  openRegisterModal,
  randomClerkTestPassword,
  registerClerkTestUser,
  signOutClerkTestUser,
  skipWithoutClerk,
} from "./clerk-testing";
import { mockCollectionsApi } from "./collections-mock";
import { E2EEvent, VisualSizePrefix, visualSnapshotName } from "./generics";

const PLACEHOLDER_AVATAR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const SERVER_DETAILS = "/server/gcp/t2d-standard-1";
const DATABASE_DETAILS = "/database/gcp/db-c4a-highmem-48";

function ensureVisualUserSession(email: string, password: string): void {
  cy.session(["auth-visual-clerk-test", email], () => {
    registerClerkTestUser(email, password);
  });
}

function stabilizeSignedInHeader(): void {
  cy.get("#auth_button").should("exist");
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

function snap(name: string, prefix: VisualSizePrefix): void {
  E2EEvent.hideScrollbarsForScreenshot();
  cy.compareSnapshot({
    name: visualSnapshotName(name, prefix),
    exactName: true,
  });
}

function snapViewport(name: string, prefix: VisualSizePrefix): void {
  cy.scrollTo(0, 0);
  E2EEvent.hideScrollbarsForScreenshot({ lockOverflow: true });
  cy.compareSnapshot({
    name: visualSnapshotName(name, prefix),
    exactName: true,
    cypressScreenshotOptions: { capture: "viewport" },
  });
}

function snapUntil(
  name: string,
  prefix: VisualSizePrefix,
  bottomSelector: string,
  padding = 16,
): void {
  cy.scrollTo(0, 0);
  cy.get(bottomSelector).first().should("be.visible");
  cy.window().then((win) => {
    const bottom = win.document
      .querySelector(bottomSelector)
      ?.getBoundingClientRect().bottom;
    expect(bottom, `${bottomSelector} bottom`).to.be.a("number");
    const width = win.document.documentElement.clientWidth;
    const height = Math.ceil((bottom ?? 0) + padding);
    const fitsViewport = height <= win.innerHeight;
    E2EEvent.hideScrollbarsForScreenshot({ lockOverflow: fitsViewport });
    cy.compareSnapshot({
      name: visualSnapshotName(name, prefix),
      exactName: true,
      cypressScreenshotOptions: {
        capture: fitsViewport ? "viewport" : "fullPage",
        clip: { x: 0, y: 0, width, height },
      },
    });
  });
}

export function registerAuthVisualSuites(prefix: VisualSizePrefix): void {
  describe("Auth visual — guest modals", () => {
    let pendingEmail: string | undefined;

    skipWithoutClerk();

    afterEach(() => {
      const email = pendingEmail;
      pendingEmail = undefined;
      deleteClerkTestUser(email);
    });

    it("compares sign-in modal", () => {
      E2EEvent.visitURL("/", 2000);
      openGuestAuthButton("Log in");
      cy.get(".auth-modal__title").should(
        "contain.text",
        "Sign in to Spare Cores",
      );
      prepareLandingChrome();
      snapViewport("auth-sign-in-modal", prefix);
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
      snapViewport("auth-register-default-subtitle", prefix);
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
      cy.get("sc-pagination").invoke("css", "visibility", "hidden");
      snapViewport("auth-register-feature-subtitle", prefix);
    });

    it("compares registration consent step", () => {
      pendingEmail = clerkTestEmail("consent");

      openRegisterModal();
      fillRegisterDetails(pendingEmail, randomClerkTestPassword());
      expectAuthModalStep("One last step");
      prepareLandingChrome();
      snapViewport("auth-register-consent", prefix);
    });

    it("compares registration verify step", () => {
      pendingEmail = clerkTestEmail("verify");

      openRegisterModal();
      fillRegisterDetails(pendingEmail, randomClerkTestPassword());
      acceptRegisterConsent();
      cy.contains(".auth-modal__subtitle", pendingEmail).invoke(
        "text",
        "Enter the verification code sent to sc-www+clerk_test@example.com.",
      );
      prepareLandingChrome();
      snapViewport("auth-register-verify", prefix);
    });
  });

  describe("Auth visual — authenticated", () => {
    let visualEmail: string | undefined;
    let visualPassword: string | undefined;

    skipWithoutClerk();

    before(() => {
      visualEmail = clerkTestEmail(`visual-${prefix}`);
      visualPassword = randomClerkTestPassword();
      ensureVisualUserSession(visualEmail, visualPassword);
    });

    beforeEach(() => {
      mockCollectionsApi();
      expect(visualEmail, "visualEmail")
        .to.be.a("string")
        .and.have.length.greaterThan(0);
      expect(visualPassword, "visualPassword")
        .to.be.a("string")
        .and.have.length.greaterThan(0);
      ensureVisualUserSession(visualEmail!, visualPassword!);
    });

    after(() => {
      const email = visualEmail;
      visualEmail = undefined;
      visualPassword = undefined;
      deleteClerkTestUser(email);
    });

    it("compares signed-in header", () => {
      E2EEvent.visitURL("/", 2000);
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snapUntil("auth-signed-in-header", prefix, ".sc-shell-chrome");
    });

    it("compares signed-in account menu", () => {
      E2EEvent.visitURL("/", 2000);
      cy.get("#auth_button").should("be.visible").click();
      cy.get("#auth_options").should("be.visible");
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snapUntil("auth-signed-in-account-menu", prefix, "#auth_options");
    });

    it("compares edit profile", () => {
      E2EEvent.visitURL("/", 2000);
      cy.get("#auth_button").should("be.visible").click();
      cy.get("#auth_options").should("be.visible");
      cy.contains("#auth_options button", "Edit Profile").click();
      cy.get(".cl-userProfile-root, .cl-modalContent, .cl-card", {
        timeout: 20000,
      }).should("be.visible");
      cy.get(".cl-userProfile-root")
        .contains(visualEmail!)
        .invoke("text", "sc-www+clerk_test@example.com");
      cy.get(".cl-userProfile-root .cl-avatarBox")
        .should("have.length.at.least", 1)
        .invoke("css", "visibility", "hidden");
      stabilizeSignedInHeader();
      prepareLandingChrome();
      snapViewport("auth-edit-profile", prefix);
    });

    it("compares unlocked server listing bookmarks", () => {
      E2EEvent.visitURL("/servers", 4000);
      cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible");
      cy.get(
        "button.page-header__bookmark:not(.page-header__bookmark--locked)",
      ).should("be.visible");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("servers_table");
      snapUntil(
        "auth-unlocked-server-listing-bookmarks",
        prefix,
        "sc-page-header + div",
      );
    });

    it("compares unlocked database listing bookmarks", () => {
      E2EEvent.visitURL("/databases", 4000);
      cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible");
      cy.get(
        "button.page-header__bookmark:not(.page-header__bookmark--locked)",
      ).should("be.visible");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("databases_table");
      snapUntil(
        "auth-unlocked-database-listing-bookmarks",
        prefix,
        "sc-page-header + div",
      );
    });

    it("compares unlocked server details bookmark", () => {
      E2EEvent.visitURL(SERVER_DETAILS, 4000);
      cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible");
      stabilizeSignedInHeader();
      prepareServerDetailsChrome();
      snapUntil(
        "auth-unlocked-server-details-bookmark",
        prefix,
        "#server_base_info_box",
      );
    });

    it("compares unlocked database details bookmark", () => {
      E2EEvent.visitURL(DATABASE_DETAILS, 4000);
      cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible");
      stabilizeSignedInHeader();
      prepareDatabaseDetailsChrome();
      snapUntil(
        "auth-unlocked-database-details-bookmark",
        prefix,
        "#database_base_info_box",
      );
    });

    it("compares empty bookmarks page", () => {
      openBookmarksPage();
      cy.contains("No bookmarks match the current filters.").should(
        "be.visible",
      );
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      snap("auth-bookmarks-empty", prefix);
    });

    it("compares populated bookmarks page", () => {
      E2EEvent.visitURL("/servers", 4000);
      cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible").click();
      cy.get("sc-bookmark-button button.bookmark-button--active", {
        timeout: 20000,
      }).should("have.length.at.least", 1);

      openBookmarksPage();
      cy.get("article.bookmarks-card").should("have.length.at.least", 1);
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      snap("auth-bookmarks-populated", prefix);
    });

    it("compares save-search modal on servers", () => {
      E2EEvent.visitURL(SERVERS_FILTERED_URL, 4000);
      openPageHeaderSaveModal("server-listing-save-search-modal");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("servers_table");
      snapViewport("auth-save-search-servers-modal", prefix);
    });

    it("compares save-search modal on databases", () => {
      E2EEvent.visitURL(DATABASES_FILTERED_URL, 4000);
      openPageHeaderSaveModal("database-listing-save-search-modal");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideListingTableResultsForScreenshot("databases_table");
      snapViewport("auth-save-search-databases-modal", prefix);
    });

    it("compares save-comparison modal", () => {
      E2EEvent.visitURL(SERVER_COMPARE_URL, 4000);
      openPageHeaderSaveModal("server-compare-save-modal");
      stabilizeSignedInHeader();
      prepareServerCompareChrome();
      snapViewport("auth-save-comparison-modal", prefix);
    });

    it("compares save-assessment modal", () => {
      loadAdvisorExample();
      openPageHeaderSaveModal("advisor-save-modal");
      stabilizeSignedInHeader();
      E2EEvent.prepareHeaderForScreenshot();
      E2EEvent.hideBaselineServerCaretForScreenshot();
      snapViewport("auth-save-assessment-modal", prefix);
    });

    it("compares signed-out header after sign-out", () => {
      signOutClerkTestUser();
      prepareLandingChrome();
      snapUntil("auth-signed-out-header", prefix, ".sc-shell-chrome");
    });
  });
}
