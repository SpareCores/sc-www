import { E2EEvent } from "../support/generics";

describe("Bookmarks auth guard", () => {
  it("redirects unauthenticated guests away from /bookmarks", () => {
    E2EEvent.visitURL("/bookmarks", 1000);
    cy.url().should("eq", E2EEvent.buildAbsoluteURL("/"));
  });
});
