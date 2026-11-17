import type { ClerkTestUser } from "../../../support/clerk-users";
import {
  signInClerkTestUser,
  skipWithoutClerk,
  withRegisteredClerkTestUser,
} from "../../../support/clerk-testing";

type TokenOwner = "user" | "organization";

const TOKENS_SECTION = '[data-testid="profile-api-tokens"]';
const NEW_TOKEN_BUTTON = '[data-testid="profile-api-token-new"] button';

function openUserProfile(): void {
  cy.get("#auth_button").should("be.visible").click();
  cy.get("#auth_options").should("be.visible");
  cy.contains("#auth_options button", "Edit Profile").click();
  cy.get('[data-testid="profile-modal"]', { timeout: 20000 }).should(
    "be.visible",
  );
}

function openTokensTab(title: string): void {
  cy.get('[data-testid="profile-tab-tokens"]').click();
  cy.get(TOKENS_SECTION, { timeout: 20000 })
    .should("be.visible")
    .and("contain.text", title);
  cy.get(`${TOKENS_SECTION} sc-loading-spinner`, { timeout: 20000 }).should(
    "not.exist",
  );
}

function signInWithPersonalAccount(user: ClerkTestUser): void {
  signInClerkTestUser(user);
  cy.window().then({ timeout: 20000 }, (win) =>
    win.Clerk.setActive({ organization: null }),
  );
}

function switchToOrganization(name: string): void {
  cy.get('[data-testid="profile-tab-organization"]')
    .should("not.be.disabled")
    .click();
  cy.contains('[data-testid="profile-organization-switch"] li', name)
    .find('[data-testid="profile-organization-option"]')
    .click();
  cy.get('[data-testid="profile-organization-current"]', {
    timeout: 20000,
  }).should("contain.text", name);
}

function mockCreateToken(name: string, owner: TokenOwner): void {
  cy.intercept("POST", "**/tokens", (request) => {
    expect(request.headers).to.have.property("authorization");
    expect(request.body).to.deep.equal({
      name,
      owner,
      seconds_until_expiration: 30 * 24 * 60 * 60,
    });
    request.reply({
      statusCode: 201,
      body: {
        id: "ak_e2e",
        name,
        secret: `${name}-secret`,
        owner,
        subject: owner === "user" ? "user_e2e" : "org_e2e",
        expiration: null,
      },
    });
  }).as("createToken");
}

function createToken(name: string): void {
  cy.get('[data-testid="profile-api-token-name"]').type(name);
  cy.get('[data-testid="profile-api-token-expiration"]').select("30 days");
  cy.get('[data-testid="profile-api-token-submit"] button').click();
  cy.wait("@createToken");
  cy.get('[data-testid="profile-api-token-secret"]')
    .should("be.visible")
    .and("contain.text", `${name}-secret`)
    .and("contain.text", name);
}

describe("Profile API tokens without an organization", () => {
  skipWithoutClerk();
  const user = withRegisteredClerkTestUser("api-tokens");

  it("creates a personal API token and shows its secret once", () => {
    mockCreateToken("e2e-token", "user");

    signInClerkTestUser(user);
    openUserProfile();

    cy.get('[data-testid="profile-tab-organization"]').should("be.disabled");
    openTokensTab("Personal tokens");

    cy.get(NEW_TOKEN_BUTTON).should("not.be.disabled").click();
    createToken("e2e-token");
  });
});

describe("Profile API tokens in an organization", () => {
  skipWithoutClerk();
  const admin = withRegisteredClerkTestUser("api-tokens-admin");
  const member = withRegisteredClerkTestUser("api-tokens-member");
  const organizationName = `e2e-api-tokens-${Date.now()}`;
  const memberVisibleKey = "e2e-member-visible";
  const adminRevokedKey = "e2e-admin-revoked";
  let organizationId = "";

  before(() => {
    cy.task<string>(
      "createClerkTestOrganization",
      {
        name: organizationName,
        adminEmail: admin.email,
        memberEmail: member.email,
      },
      { timeout: 20000 },
    ).then((id) => {
      organizationId = id;
      for (const name of [memberVisibleKey, adminRevokedKey]) {
        cy.task(
          "createClerkTestApiKey",
          { name, subject: id, createdByEmail: admin.email },
          { timeout: 20000 },
        );
      }
    });
  });

  after(() => {
    if (organizationId) {
      cy.task("deleteClerkTestOrganization", organizationId, {
        timeout: 20000,
      });
    }
  });

  it("lets members switch organizations and read organization tokens", () => {
    signInWithPersonalAccount(member);
    openUserProfile();

    switchToOrganization(organizationName);
    cy.contains(
      '[data-testid="profile-organization-switch"] li',
      organizationName,
    ).should("contain.text", "Active");

    openTokensTab(`${organizationName} tokens`);
    cy.get(TOKENS_SECTION)
      .should("contain.text", memberVisibleKey)
      .find('[data-testid="profile-api-token-revoke"]')
      .should("not.exist");
    cy.get('[data-testid="profile-api-token-new"]').should("not.exist");

    cy.get('[data-testid="profile-tab-organization"]').click();
    cy.get('[data-testid="profile-organization-personal"]').click();
    cy.get('[data-testid="profile-organization-current"]', {
      timeout: 20000,
    }).should("contain.text", "Personal account");

    openTokensTab("Personal tokens");
    cy.get(TOKENS_SECTION).should("not.contain.text", memberVisibleKey);
    cy.get(NEW_TOKEN_BUTTON).should("not.be.disabled");
  });

  it("lets admins create organization tokens and revoke them", () => {
    mockCreateToken("e2e-org-token", "organization");

    signInWithPersonalAccount(admin);
    openUserProfile();
    switchToOrganization(organizationName);

    openTokensTab(`${organizationName} tokens`);
    cy.get(NEW_TOKEN_BUTTON).should("not.be.disabled").click();
    createToken("e2e-org-token");

    cy.contains(
      `${TOKENS_SECTION} [data-testid="profile-api-token-item"]`,
      adminRevokedKey,
    )
      .find('[data-testid="profile-api-token-revoke"]')
      .click();
    cy.get(`${TOKENS_SECTION} .profile-modal__confirm`)
      .contains("button", "Revoke")
      .click();
    cy.get(TOKENS_SECTION, { timeout: 20000 })
      .should("not.contain.text", adminRevokedKey)
      .and("contain.text", memberVisibleKey);
  });
});
