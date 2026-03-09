import { E2EEvent } from "../support/generics";

describe("Legal Documents", () => {
  [
    { slug: "terms-of-service", title: "Terms of Service" },
    { slug: "privacy-policy", title: "Privacy Policy" },
  ].forEach(({ slug, title }) => {
    it(`should render the ${title} page content, breadcrumbs, and last updated footer`, () => {
      E2EEvent.visitURL(`/legal/${slug}`);

      // Check Title (Emerald green <h1>)
      E2EEvent.isVisibleAndNotEmpty("h1.text-emerald-400");

      // Check rendered Markdown body
      E2EEvent.isVisibleAndNotEmpty(".html_content");

      // Verify the breadcrumb navigation matches the metadata title
      E2EEvent.checkBreadcrumbs();

      // Check that the footer "Last Updated" is rendered
      cy.contains("Last updated:").should("be.visible");
    });
  });
});
