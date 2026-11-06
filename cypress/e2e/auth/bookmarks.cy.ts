import { E2EEvent } from "../../support/generics";

describe("Bookmarks auth guard", () => {
  it("redirects unauthenticated guests away from /bookmarks", () => {
    E2EEvent.visitURL("/bookmarks");
    cy.url({ timeout: 30000 }).should("eq", E2EEvent.buildAbsoluteURL("/"));
  });
});
