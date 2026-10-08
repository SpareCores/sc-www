import { E2EEvent } from "../support/generics";

function assertRegisterModalOpened(): void {
  cy.get(".auth-modal__title").should("contain.text", "Create your account");
  cy.contains(".auth-modal__title", "Sign in to Spare Cores").should(
    "not.exist",
  );
}

function assertRegisterModalFromToast(): void {
  cy.get('[data-cy="toast"]').should("be.visible");
  cy.get('[data-cy="toast-title"]').should("be.visible");
  cy.get("[data-toast-action]").should("be.visible").click();
  assertRegisterModalOpened();
}

function expandCollapsedFilterCategories(): void {
  cy.get('[role="button"][aria-expanded="false"]').each(($button) => {
    cy.wrap($button).click({ force: true });
  });
}

function expandGeoSection(titleSelector: string): void {
  cy.get(titleSelector).should("be.visible");
  cy.get(titleSelector)
    .parent()
    .find("svg.cursor-pointer")
    .should("have.length.at.least", 1)
    .each(($chevron) => {
      cy.wrap($chevron).click({ force: true });
    });
}

describe("Guest feature limits", () => {
  it("opens register from the server compare limit toast", () => {
    E2EEvent.visitURL("/servers", 4000);
    cy.get('[id^="server_compare_checkbox_"]')
      .should("have.length.at.least", 4)
      .then(($boxes) => {
        for (let i = 0; i < 4; i += 1) {
          cy.wrap($boxes[i]).check({ force: true });
        }
      });

    assertRegisterModalFromToast();
  });

  it("opens register from the database compare limit toast", () => {
    E2EEvent.visitURL("/databases", 4000);
    cy.get('[id^="database_compare_checkbox_"]')
      .should("have.length.at.least", 4)
      .then(($boxes) => {
        for (let i = 0; i < 4; i += 1) {
          cy.wrap($boxes[i]).check({ force: true });
        }
      });

    assertRegisterModalFromToast();
  });

  it("opens register from the country limit toast", () => {
    E2EEvent.visitURL("/servers", 4000);
    expandCollapsedFilterCategories();
    expandGeoSection('[id="filter_title_countries"]');

    cy.get('[id^="filter_country_"]')
      .should("have.length.at.least", 2)
      .then(($boxes) => {
        cy.wrap($boxes[0]).check({ force: true });
        cy.wrap($boxes[1]).should("be.disabled");
      });

    assertRegisterModalFromToast();
  });

  it("opens register from the region limit toast", () => {
    E2EEvent.visitURL("/servers", 4000);
    expandCollapsedFilterCategories();
    expandGeoSection('[id="filter_title_vendor_regions"]');

    cy.get('[id^="filter_vendor_region_"]')
      .should("have.length.at.least", 4)
      .then(($boxes) => {
        for (let i = 0; i < 3; i += 1) {
          cy.wrap($boxes[i]).check({ force: true });
        }
        cy.wrap($boxes[3]).should("be.disabled");
      });

    assertRegisterModalFromToast();
  });

  it("opens register from a listing bookmark button", () => {
    E2EEvent.visitURL("/servers", 4000);
    cy.get("sc-bookmark-button button.bookmark-button--locked")
      .first()
      .should("be.visible")
      .click();
    assertRegisterModalOpened();
  });

  it("opens register from the listing page-header bookmark", () => {
    E2EEvent.visitURL("/servers", 4000);
    cy.get("button.page-header__bookmark--locked").should("be.visible").click();
    assertRegisterModalOpened();
  });

  it("opens register from a details bookmark button", () => {
    E2EEvent.visitURL("/server/aws/c6g.large", 4000);
    cy.get("sc-bookmark-button button.bookmark-button--locked")
      .first()
      .should("be.visible")
      .click();
    assertRegisterModalOpened();
  });
});
