import { E2EEvent } from "../support/generics";

function assertRegisterModalFromToast(): void {
  cy.get('[data-cy="toast"]').should("be.visible");
  cy.get('[data-cy="toast-title"]').should("be.visible");
  cy.get("[data-toast-action]").should("be.visible").click();
  cy.get(".auth-modal__title").should("contain.text", "Create your account");
  cy.contains(".auth-modal__title", "Sign in to Spare Cores").should(
    "not.exist",
  );
}

function expandCollapsedFilterCategories(): void {
  cy.get('[role="button"][aria-expanded="false"]').each(($button) => {
    cy.wrap($button).click({ force: true });
  });
}

function expandGeoContinents(): void {
  cy.get('[id^="filter_continent_"]').each(($checkbox) => {
    cy.wrap($checkbox)
      .parents(".flex.justify-between")
      .find("svg")
      .first()
      .click({ force: true });
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
    cy.get('[id="filter_title_countries"]').should("exist");
    expandGeoContinents();

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
    cy.get('[id="filter_title_vendor_regions"]').should("exist");

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
});
