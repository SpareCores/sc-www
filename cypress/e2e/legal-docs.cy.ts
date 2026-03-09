import { E2EEvent } from "../support/generics";

describe("Legal Documents", () => {
  it("should verify TOC and content parsing", () => {
    E2EEvent.visitURL("/legal/terms-of-service");

    // Check Title (Emerald green <h1>)
    E2EEvent.isVisible("h1.text-emerald-400");

    // Check rendered Markdown body
    E2EEvent.isVisible(".html_content");

    // Verify the breadcrumb navigation matches the metadata title
    E2EEvent.checkBreadcrumbs();

    // Check that the footer "Last Updated" is rendered
    cy.contains("Last updated:").should("be.visible");
  });
});
