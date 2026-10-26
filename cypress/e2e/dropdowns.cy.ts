import { E2EEvent } from "../support/generics";

describe("Dropdowns", () => {
  it("closes a header dropdown on Escape and restores focus", () => {
    E2EEvent.visitURL("/");

    cy.get("#about_button button").click();
    cy.get("#about_options").should("be.visible");
    cy.get("#about_button button").should("have.attr", "aria-expanded", "true");

    cy.get("body").type("{esc}");

    cy.get("#about_options").should("not.be.visible");
    cy.get("#about_button button").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.focused().closest("#about_button").should("exist");
  });

  it("moves focus into a header dropdown opened from the keyboard", () => {
    E2EEvent.visitURL("/");

    cy.get("#about_button button").then(($button) => $button[0].click());

    cy.get("#about_options").should("be.visible");
    cy.focused()
      .should("match", "a[href]")
      .closest("#about_options")
      .should("exist");
  });

  it("closes a page dropdown on an outside click", () => {
    E2EEvent.visitURL("/servers");

    cy.get("#currency_button").click();
    cy.get("#currency_options").should("be.visible");

    cy.get("sc-page-header").first().click("topLeft");

    cy.get("#currency_options").should("not.exist");
  });

  it("layers header dropdowns above and page dropdowns below the header", () => {
    E2EEvent.visitURL("/servers");

    cy.get(".sc-shell-chrome").should("have.css", "z-index", "50");

    cy.get("#about_button button").click();
    cy.get("#about_options").should("be.visible");
    cy.get("#about_options").closest(".sc-shell-chrome").should("exist");
    cy.get("#about_options")
      .closest(".cdk-overlay-container")
      .should("not.exist");
    cy.get("body").type("{esc}");

    cy.get("#currency_button").click();
    cy.get("#currency_options")
      .closest(".cdk-overlay-container")
      .should("have.class", "sc-page-overlay-container")
      .and("have.css", "z-index", "40");
  });

  it("flips the page-size dropdown above its trigger near the viewport bottom", () => {
    E2EEvent.visitURL("/servers", 4000);

    cy.get("#pagesize_button").scrollIntoView({
      offset: { top: -1000, left: 0 },
    });
    cy.get("#pagesize_button").click();

    cy.get("#pagesize_options").should("be.visible");
    cy.get("#pagesize_button").then(($trigger) => {
      const triggerTop = $trigger[0].getBoundingClientRect().top;
      cy.get("#pagesize_options").should(($panel) => {
        expect($panel[0].getBoundingClientRect().bottom).to.be.at.most(
          triggerTop,
        );
      });
    });
  });
});
