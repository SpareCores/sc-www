import { setupClerkTestingToken } from "@clerk/testing/cypress";
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
    setupClerkTestingToken();

    const runId = Date.now();
    createdEmail = `sc-www+clerk_test+${runId}@example.com`;
    const password = `TestPass!${runId}`;

    E2EEvent.visitURL("/", 2000);
    cy.contains("button", "Register").click();

    cy.get(".auth-modal__title").should("contain.text", "Create your account");
    cy.get('input[name="firstName"]').clear().type("Ada");
    cy.get('input[name="lastName"]').clear().type("Lovelace");
    cy.get('input[name="emailAddress"]').clear().type(createdEmail);
    cy.get('input[name="password"]').clear().type(password);
    cy.get('.auth-modal__form button[type="submit"]').first().click();

    cy.get(".auth-modal__title", { timeout: 20000 }).should(
      "contain.text",
      "One last step",
    );
    cy.get('input[name="legalAccepted"]').check({ force: true });
    cy.contains("button", "Continue").click();

    cy.get(".auth-modal__title", { timeout: 20000 }).should(
      "contain.text",
      "Verify your email",
    );
    cy.get('input[name="verificationCode"]').clear().type("424242");
    cy.contains("button", "Verify email").click();

    cy.get(".auth-modal", { timeout: 20000 }).should("not.exist");
    cy.get("#auth_button", { timeout: 20000 }).should("be.visible");
  });
});
