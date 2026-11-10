import { setupClerkTestingToken } from "@clerk/testing/cypress";
import type { ClerkTestUser } from "./clerk-users";
import { E2EEvent } from "./generics";

export function randomClerkTestPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `Aa1!${token}`;
}

export function bypassClerkBotProtection(): void {
  cy.env<{ CLERK_FAPI?: string; CLERK_TESTING_TOKEN?: string }>(
    ["CLERK_FAPI", "CLERK_TESTING_TOKEN"],
    { log: false },
  ).then(({ CLERK_FAPI: fapi, CLERK_TESTING_TOKEN: token }) => {
    if (!fapi || !token) {
      throw new Error(
        `Clerk testing env missing (CLERK_FAPI=${Boolean(fapi)}, CLERK_TESTING_TOKEN=${Boolean(token)}). Ensure clerkSetup ran with NG_APP_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.`,
      );
    }

    setupClerkTestingToken();
  });
}

export const CLERK_TEST_CODE = "424242";

export function skipWithoutClerk(): void {
  before(function () {
    if (!Cypress.expose("CLERK_AVAILABLE")) {
      this.skip();
    }
  });
}

export function clerkTestEmail(label: string): string {
  return `sc-www+clerk_test+${label}+${Date.now()}@example.com`;
}

export function waitForClerk(): void {
  cy.window({ timeout: 30000 }).should((win) => {
    expect(win).to.have.property("Clerk");
    expect(win.Clerk.loaded).to.eq(true);
  });
}

export function visitWithClerk(url: string): void {
  E2EEvent.visitURL(url);
  waitForClerk();
}

export function openGuestAuthButton(label: "Register" | "Log in"): void {
  const findVisibleButton = ($body: JQuery<HTMLElement>) =>
    $body.find("button").filter((_, el) => {
      const text = (el.textContent || "").trim();
      return text === label && Cypress.$(el).is(":visible");
    });

  cy.get("body", { timeout: 20000 })
    .should(($body) => {
      expect(
        findVisibleButton($body).length > 0 ||
          $body.find("#menu_button").is(":visible"),
        `visible "${label}" button or menu button`,
      ).to.eq(true);
    })
    .then(($body) => {
      const match = findVisibleButton($body);

      if (match.length) {
        cy.wrap(match.first()).click();
        return;
      }

      cy.get("#menu_button").should("be.visible").click();
      cy.get("#menu_options").should("be.visible");
      cy.contains("#menu_options button", label).should("be.visible").click();
    });
}

export function expectAuthModalStep(title: string): void {
  cy.get(".auth-modal__title", { timeout: 30000 }).should(($title) => {
    const text = $title.text().replace(/\s+/g, " ").trim();
    const error = Cypress.$(".auth-modal__error").text().trim();
    expect(text, error || "auth modal step").to.eq(title);
  });
}

function openGuestAuthModal(label: "Register" | "Log in", title: string): void {
  bypassClerkBotProtection();
  visitWithClerk("/");
  openGuestAuthButton(label);
  expectAuthModalStep(title);
}

export function openRegisterModal(): void {
  openGuestAuthModal("Register", "Create your account");
}

export function openLoginModal(): void {
  openGuestAuthModal("Log in", "Sign in to Spare Cores");
}

function submitAuthForm(): void {
  cy.get('.auth-modal__form button[type="submit"]')
    .first()
    .should("not.be.disabled")
    .click();
}

export function fillRegisterDetails(email: string, password: string): void {
  cy.get('input[name="firstName"]').clear().type("Test");
  cy.get('input[name="lastName"]').clear().type("User");
  cy.get('input[name="emailAddress"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password, { log: false });
  submitAuthForm();
}

export function acceptRegisterConsent(): void {
  expectAuthModalStep("One last step");
  cy.get('input[name="legalAccepted"]').check({ force: true });
  cy.contains("button", "Continue").should("not.be.disabled").click();
  expectAuthModalStep("Verify your email");
}

export function expectSignedIn(): void {
  cy.get(".auth-modal", { timeout: 30000 }).should("not.exist");
  cy.get("#auth_button", { timeout: 30000 }).should("be.visible");
}

export function registerClerkTestUser(email: string, password: string): void {
  openRegisterModal();
  fillRegisterDetails(email, password);
  acceptRegisterConsent();
  cy.get('input[name="verificationCode"]').clear().type(CLERK_TEST_CODE);
  cy.contains("button", "Verify email").should("not.be.disabled").click();
  expectSignedIn();
}

export function submitLoginForm(email: string, password: string): void {
  openLoginModal();
  cy.get('input[name="emailAddress"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password, { log: false });
  submitAuthForm();
}

export function completeDeviceVerificationIfAsked(): void {
  const isDeviceVerification = ($body: JQuery<HTMLElement>) =>
    $body.find(".auth-modal__title").text().trim() === "Verify this device";

  cy.get("body", { timeout: 30000 })
    .should(($body) => {
      expect(
        $body.find(".auth-modal").length === 0 || isDeviceVerification($body),
        "sign-in finished or device verification requested",
      ).to.eq(true);
    })
    .then(($body) => {
      if (!isDeviceVerification($body)) {
        return;
      }
      cy.get('input[name="secondFactorCode"]').clear().type(CLERK_TEST_CODE);
      cy.contains(".auth-modal button", "Verify")
        .should("not.be.disabled")
        .click();
    });
}

export function loginClerkTestUser(email: string, password: string): void {
  submitLoginForm(email, password);
  completeDeviceVerificationIfAsked();
  expectSignedIn();
}

export function signOutClerkTestUser(): void {
  E2EEvent.visitURL("/");
  cy.get("#auth_button").should("be.visible").click();
  cy.get("#auth_options").should("be.visible");
  cy.contains("#auth_options button", "Sign Out").click();
  cy.get("#auth_button").should("not.exist");
  cy.then(() => Cypress.session.clearAllSavedSessions());
}

export function deleteClerkTestUser(email: string | undefined): void {
  if (email && Cypress.expose("CLERK_AVAILABLE")) {
    cy.task("deleteClerkUserByEmail", email, { timeout: 20000 });
  }
}

async function completeClerkPasswordSignIn(
  win: Window,
  { email, password }: ClerkTestUser,
): Promise<void> {
  const signIn = win.Clerk.client?.signIn;
  if (!signIn) {
    throw new Error("Clerk client is not ready");
  }

  let result = await signIn.create({ identifier: email, password });

  if (
    result.status === "needs_second_factor" ||
    result.status === "needs_client_trust"
  ) {
    const factor = result.supportedSecondFactors?.find(
      ({ strategy }) => strategy === "email_code",
    );
    if (!factor || !("emailAddressId" in factor) || !factor.emailAddressId) {
      throw new Error("Clerk requested a second factor without email_code");
    }
    await result.prepareSecondFactor({
      strategy: "email_code",
      emailAddressId: factor.emailAddressId,
    });
    result = await result.attemptSecondFactor({
      strategy: "email_code",
      code: CLERK_TEST_CODE,
    });
  }

  if (result.status !== "complete" || !result.createdSessionId) {
    throw new Error(`Clerk sign-in ended with status ${result.status}`);
  }

  await win.Clerk.setActive({ session: result.createdSessionId });
}

export function signInClerkTestUser(user: ClerkTestUser): void {
  bypassClerkBotProtection();
  visitWithClerk("/");
  cy.window().then({ timeout: 30000 }, (win) =>
    completeClerkPasswordSignIn(win, user),
  );
  expectSignedIn();
}

export function ensureClerkTestSession(user: ClerkTestUser): void {
  cy.session(["clerk-test-user", user.email], () => signInClerkTestUser(user));
}

export function withRegisteredClerkTestUser(label: string): ClerkTestUser {
  const user: ClerkTestUser = { email: "", password: "" };

  before(() => {
    user.email = clerkTestEmail(label);
    user.password = randomClerkTestPassword();
    cy.task("createClerkTestUser", user, { timeout: 20000 });
  });

  after(() => {
    deleteClerkTestUser(user.email);
  });

  return user;
}
