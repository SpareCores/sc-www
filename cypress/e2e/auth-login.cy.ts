import {
  UNLOCKED_BOOKMARK_BUTTON,
  openBookmarksPage,
} from "../support/bookmarks";
import {
  CLERK_TEST_CODE,
  completeDeviceVerificationIfAsked,
  expectAuthModalStep,
  expectSignedIn,
  loginClerkTestUser,
  openLoginModal,
  randomClerkTestPassword,
  signOutClerkTestUser,
  skipWithoutClerk,
  submitLoginForm,
  withRegisteredClerkTestUser,
} from "../support/clerk-testing";
import { mockCollectionsApi } from "../support/collections-mock";
import { E2EEvent } from "../support/generics";

function openUserProfile(): void {
  cy.get("#auth_button").should("be.visible").click();
  cy.get("#auth_options").should("be.visible");
  cy.contains("#auth_options button", "Edit Profile").click();
  cy.get('[data-testid="profile-modal"]', { timeout: 20000 }).should(
    "be.visible",
  );
}

function expectBookmarkCount(count: number): void {
  openBookmarksPage();
  cy.get("article.bookmarks-card").should("have.length", count);
}

function expectLoginRejected(email: string, password: string): void {
  submitLoginForm(email, password);
  cy.get(".auth-modal__error", { timeout: 30000 }).should("be.visible");
}

function expectRedirectedFromBookmarks(): void {
  E2EEvent.visitURL("/bookmarks", 1000);
  cy.url().should("eq", E2EEvent.buildAbsoluteURL("/"));
}

describe("Clerk email login", () => {
  skipWithoutClerk();
  const user = withRegisteredClerkTestUser("login");

  it("shows an error for a wrong password", () => {
    expectLoginRejected(user.email, randomClerkTestPassword());
    expectAuthModalStep("Sign in to Spare Cores");
    cy.get("#auth_button").should("not.exist");
  });

  it("signs in an existing user and lets them open bookmarks", () => {
    loginClerkTestUser(user.email, user.password);

    E2EEvent.visitURL("/bookmarks", 4000);
    cy.location("pathname").should("eq", "/bookmarks");
  });

  it("keeps the session across reload and restores bookmarks after re-login", () => {
    mockCollectionsApi();
    loginClerkTestUser(user.email, user.password);

    E2EEvent.visitURL("/servers", 4000);
    cy.get(UNLOCKED_BOOKMARK_BUTTON).first().should("be.visible").click();
    cy.get("sc-bookmark-button button.sc-bookmark-toggle--active", {
      timeout: 20000,
    }).should("have.length", 1);

    cy.reload();
    cy.get("#auth_button", { timeout: 30000 }).should("be.visible");
    expectBookmarkCount(1);

    signOutClerkTestUser();
    expectRedirectedFromBookmarks();

    loginClerkTestUser(user.email, user.password);
    expectBookmarkCount(1);
  });

  it("opens the profile for the signed-in user and closes it", () => {
    loginClerkTestUser(user.email, user.password);
    openUserProfile();

    cy.get('[data-testid="profile-emails"]')
      .should("contain.text", "Email addresses")
      .and("contain.text", user.email);
    cy.get('[data-testid="profile-close"] button').click();

    cy.get('[data-testid="profile-modal"]').should("not.exist");
    cy.get("#auth_button").should("be.visible");
  });

  it("resets a forgotten password", () => {
    const newPassword = randomClerkTestPassword();

    openLoginModal();
    cy.contains(".auth-modal button", "Forgot password?").click();
    expectAuthModalStep("Reset your password");
    cy.get('input[name="resetEmailAddress"]').clear().type(user.email);
    cy.contains(".auth-modal button", "Send code")
      .should("not.be.disabled")
      .click();

    expectAuthModalStep("Set a new password");
    cy.get('input[name="verificationCode"]').clear().type(CLERK_TEST_CODE);
    cy.get('input[name="newPassword"]')
      .clear()
      .type(newPassword, { log: false });
    cy.contains(".auth-modal button", "Reset password")
      .should("not.be.disabled")
      .click();
    completeDeviceVerificationIfAsked();
    expectSignedIn();

    signOutClerkTestUser();
    expectLoginRejected(user.email, user.password);

    user.password = newPassword;
    loginClerkTestUser(user.email, user.password);
  });
});

describe("Clerk account deletion", () => {
  skipWithoutClerk();
  const user = withRegisteredClerkTestUser("delete");

  it("deletes the account from the profile", () => {
    loginClerkTestUser(user.email, user.password);
    openUserProfile();
    cy.get('[data-testid="profile-tab-security"]').click();
    cy.get('[data-testid="profile-delete-open"] button').click();
    cy.get(
      '[data-testid="profile-modal"] input[name="deleteConfirmation"]',
    ).type("Delete account");
    cy.get('[data-testid="profile-delete-submit"] button')
      .should("not.be.disabled")
      .click();

    cy.get("#auth_button", { timeout: 30000 }).should("not.exist");
    expectRedirectedFromBookmarks();
    expectLoginRejected(user.email, user.password);
  });
});
