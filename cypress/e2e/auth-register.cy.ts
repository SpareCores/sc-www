import { bypassClerkBotProtection } from "../support/clerk-testing";
import { E2EEvent } from "../support/generics";

describe("Clerk +clerk_test registration", () => {
  let createdEmail: string | undefined;

  afterEach(() => {
    if (!createdEmail) {
      return;
    }

    const email = createdEmail;
    createdEmail = undefined;
    cy.task("deleteClerkUserByEmail", email, { timeout: 20000 });
  });

  it("registers through details, consent, and email verification", () => {
    bypassClerkBotProtection();

    const runId = Date.now();
    createdEmail = `sc-www+clerk_test+${runId}@example.com`;
    const password = `ScWwwE2e!${runId}`;

    E2EEvent.visitURL("/", 2000);
    cy.window({ timeout: 30000 }).should((win) => {
      expect(win).to.have.property("Clerk");
      expect(
        (win as Window & { Clerk: { loaded: boolean } }).Clerk.loaded,
      ).to.eq(true);
    });
    cy.contains("button", "Register").filter(":visible").first().click();

    cy.get(".auth-modal__title").should("contain.text", "Create your account");
    cy.get('input[name="firstName"]').clear().type("Test");
    cy.get('input[name="lastName"]').clear().type("User");
    cy.get('input[name="emailAddress"]').clear().type(createdEmail);
    cy.get('input[name="password"]').clear().type(password);
    cy.get('.auth-modal__form button[type="submit"]')
      .first()
      .should("not.be.disabled")
      .click();

    cy.get(".auth-modal__title", { timeout: 30000 }).should(($title) => {
      const text = $title.text().replace(/\s+/g, " ").trim();
      const error = Cypress.$(".auth-modal__error").text().trim();
      expect(text, error || "register step").to.eq("One last step");
    });
    cy.get('input[name="legalAccepted"]').check({ force: true });
    cy.contains("button", "Continue").should("not.be.disabled").click();

    cy.get(".auth-modal__title", { timeout: 30000 }).should(($title) => {
      const text = $title.text().replace(/\s+/g, " ").trim();
      const error = Cypress.$(".auth-modal__error").text().trim();
      expect(text, error || "register step").to.eq("Verify your email");
    });
    cy.get('input[name="verificationCode"]').clear().type("424242");
    cy.contains("button", "Verify email").should("not.be.disabled").click();

    cy.get(".auth-modal", { timeout: 30000 }).should("not.exist");
    cy.get("#auth_button", { timeout: 30000 }).should("be.visible");
  });
});
