import {
  DATABASES_FILTERED_URL,
  SERVER_COMPARE_URL,
  SERVERS_FILTERED_URL,
  loadAdvisorExample,
  openBookmarksPage,
  openPageHeaderSaveModal,
} from "../support/bookmarks";
import {
  clerkTestEmail,
  deleteClerkTestUser,
  randomClerkTestPassword,
  registerClerkTestUser,
  skipWithoutClerk,
} from "../support/clerk-testing";
import { mockCollectionsApi } from "../support/collections-mock";
import { E2EEvent } from "../support/generics";

type SaveSource = {
  label: string;
  modalId: string;
  open: () => void;
};

const SAVE_SOURCES: SaveSource[] = [
  {
    label: "server search",
    modalId: "server-listing-save-search-modal",
    open: () => E2EEvent.visitURL(SERVERS_FILTERED_URL, 4000),
  },
  {
    label: "database search",
    modalId: "database-listing-save-search-modal",
    open: () => E2EEvent.visitURL(DATABASES_FILTERED_URL, 4000),
  },
  {
    label: "server comparison",
    modalId: "server-compare-save-modal",
    open: () => E2EEvent.visitURL(SERVER_COMPARE_URL, 4000),
  },
  {
    label: "advisor assessment",
    modalId: "advisor-save-modal",
    open: loadAdvisorExample,
  },
];

function fillAndConfirmModal(
  modalId: string,
  name: string,
  note?: string,
): void {
  cy.get(`#${modalId} input[type="text"]`).clear().type(name);
  if (note !== undefined) {
    cy.get(`#${modalId} textarea`).clear().type(note);
  }
  cy.contains(`#${modalId} button`, "Confirm")
    .should("not.be.disabled")
    .click();
  cy.get(`#${modalId}`, { timeout: 20000 }).should("have.class", "hidden");
}

function saveFromPageHeader(
  source: SaveSource,
  name: string,
  note: string,
): void {
  source.open();
  openPageHeaderSaveModal(source.modalId);
  fillAndConfirmModal(source.modalId, name, note);
}

function bookmarkCard(name: string) {
  return cy
    .contains("article.bookmarks-card h2.bookmarks-card__title", name)
    .closest("article.bookmarks-card");
}

describe("Bookmarks behaviour", () => {
  const email = clerkTestEmail("bookmarks");
  const password = randomClerkTestPassword();

  skipWithoutClerk();

  beforeEach(() => {
    mockCollectionsApi();
    cy.session(["auth-bookmarks-clerk-test", email], () => {
      registerClerkTestUser(email, password);
    });
  });

  after(() => {
    deleteClerkTestUser(email);
  });

  SAVE_SOURCES.forEach((source) => {
    it(`saves a ${source.label} and lists it on the bookmarks page`, () => {
      const name = `E2E ${source.label} ${Date.now()}`;

      saveFromPageHeader(source, name, `Note for ${source.label}`);

      openBookmarksPage();
      cy.get("article.bookmarks-card").should("have.length", 1);
      bookmarkCard(name).should("be.visible");
    });
  });

  it("renames, shows the note of, and deletes a saved bookmark", () => {
    const name = `E2E rename ${Date.now()}`;
    const renamed = `${name} renamed`;
    const note = "Note shown in the bookmarks page";

    saveFromPageHeader(SAVE_SOURCES[0], name, note);
    openBookmarksPage();

    bookmarkCard(name).find('button[aria-label="Edit"]').click();
    cy.get("#bookmarks-edit-modal").should("not.have.class", "hidden");
    fillAndConfirmModal("bookmarks-edit-modal", renamed);
    bookmarkCard(renamed).should("be.visible");

    bookmarkCard(renamed).find('button[aria-label="View note"]').click();
    cy.get("#bookmarks-note-modal")
      .should("not.have.class", "hidden")
      .and("contain.text", note);
    cy.get('#bookmarks-note-modal button[aria-label="Close modal"]').click();

    bookmarkCard(renamed).find('button[aria-label="Delete"]').click();
    cy.get("sc-loading-spinner", { timeout: 20000 }).should("not.exist");
    cy.contains("No bookmarks match the current filters.").should("be.visible");
  });
});
