import { E2EEvent } from "../support/generics";

describe("Legal Documents", () => {
  [
    { slug: "terms-of-service", title: "Terms of Service" },
    { slug: "privacy-policy", title: "Privacy Policy" },
  ].forEach(({ slug, title }) => {
    it(`should render the ${title} page content, breadcrumbs, and last updated footer`, () => {
      // Verify the markdown file exists and is accessible before visiting the page
      const markdownUrl = `/assets/legal/${slug}.md`;
      const markdownRequestUrl = E2EEvent.buildAbsoluteURL(markdownUrl);
      cy.request(markdownRequestUrl).then((response) => {
        expect(response.status).to.eq(200);
      });

      E2EEvent.visitURL(`/legal/${slug}`);

      // Check Title (Emerald green <h1>)
      E2EEvent.isVisibleAndNotEmpty("h1.text-emerald-400");

      // Check rendered Markdown body
      E2EEvent.isVisibleAndNotEmpty(".html_content");

      // Verify the breadcrumbs exists
      E2EEvent.checkBreadcrumbs();

      // Check that the footer "Last Updated" is rendered
      cy.contains("Last updated:").should("be.visible");
    });
  });
});
