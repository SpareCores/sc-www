import { E2EEvent } from "../support/generics";

const COMPARE_PATH =
  "/servers/compare?instances=W3siZGlzcGxheV9uYW1lIjoidDJhLXN0YW5kYXJkLTEiLCJ2ZW5kb3IiOiJnY3AiLCJzZXJ2ZXIiOiJ0MmEtc3RhbmRhcmQtMSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiYzdnLm1lZGl1bSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6ImM3Zy5tZWRpdW0iLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D";
const DATABASE_COMPARE_PATH =
  "/databases/compare?instances=W3siZGlzcGxheV9uYW1lIjoiZGIudDMubWljcm8iLCJ2ZW5kb3IiOiJhd3MiLCJkYXRhYmFzZSI6ImRiLnQzLm1pY3JvIn0seyJkaXNwbGF5X25hbWUiOiJkYi50My5zbWFsbCIsInZlbmRvciI6ImF3cyIsImRhdGFiYXNlIjoiZGIudDMuc21hbGwifV0%3D";

// Match Keeper API only — never the Angular document on :4200.
const SERVERS_SEARCH_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/servers(?:\?.*)?$/;
const DATABASES_SEARCH_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/databases(?:\?.*)?$/;
const COMPARE_SERVER_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/v2\/server\/aws\/c7g\.medium(?:\?.*)?$/;
const COMPARE_DATABASE_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/database\/aws\/db\.t3\.micro(?:\?.*)?$/;
const EXHAUSTION_TOAST_TIMEOUT_MS = 30000;
const API_WAIT_MS = 30000;

type SequenceResponse = {
  statusCode: number;
  body?: unknown;
  headers?: Record<string, string>;
};

function interceptSequence(
  method: string,
  url: RegExp,
  responses: SequenceResponse[],
  alias: string,
) {
  let attempt = 0;

  cy.intercept({ method, url }, (req) => {
    if (attempt >= responses.length) {
      throw new Error(
        `Unexpected request #${attempt + 1} for ${alias}; expected at most ${responses.length}`,
      );
    }

    const response = responses[attempt];
    attempt += 1;
    req.reply({
      statusCode: response.statusCode,
      body: response.body ?? "",
      headers: response.headers,
    });
  }).as(alias);
}

function clientNavigate(path: string) {
  cy.window().then((win) => {
    win.history.pushState({}, "", path);
    win.dispatchEvent(new PopStateEvent("popstate"));
  });
}

describe("HTTP retry errors", () => {
  // Full SSR visits hydrate from HttpTransferCache, so Cypress never sees
  // those GETs. Bootstrap on `/`, then SPA-navigate so requests hit the wire.
  beforeEach(() => {
    E2EEvent.visitURL("/", 1000);
  });

  it("retries 408 then loads /servers", () => {
    let attempt = 0;

    cy.intercept({ method: "GET", url: SERVERS_SEARCH_ROUTE }, (req) => {
      attempt += 1;
      if (attempt === 1) {
        req.reply({ statusCode: 408, body: "" });
        return;
      }
      req.continue();
    }).as("serversSearch");

    clientNavigate("/servers");

    cy.wait("@serversSearch", { timeout: API_WAIT_MS });
    cy.wait("@serversSearch", { timeout: API_WAIT_MS });
    cy.get("@serversSearch.1").its("response.statusCode").should("eq", 408);
    cy.get("@serversSearch.all").should("have.length.at.least", 2);
    cy.get("#servers_table").should("exist");
  });

  it("retries 429 with Retry-After: 0 then loads /servers", () => {
    let attempt = 0;

    cy.intercept({ method: "GET", url: SERVERS_SEARCH_ROUTE }, (req) => {
      attempt += 1;
      if (attempt === 1) {
        req.reply({
          statusCode: 429,
          body: "",
          headers: { "Retry-After": "0" },
        });
        return;
      }
      req.continue();
    }).as("serversSearch429");

    clientNavigate("/servers");

    cy.wait("@serversSearch429", { timeout: API_WAIT_MS });
    cy.wait("@serversSearch429", { timeout: API_WAIT_MS });
    cy.get("@serversSearch429.1").its("response.statusCode").should("eq", 429);
    cy.get("@serversSearch429.all").should("have.length.at.least", 2);
    cy.get("#servers_table").should("exist");
  });

  it("shows toast after exhausted 500 retries on /servers", () => {
    interceptSequence(
      "GET",
      SERVERS_SEARCH_ROUTE,
      Array.from({ length: 7 }, () => ({ statusCode: 500 })),
      "serversSearchFail",
    );

    clientNavigate("/servers");

    for (let i = 0; i < 7; i++) {
      cy.wait("@serversSearchFail", { timeout: EXHAUSTION_TOAST_TIMEOUT_MS });
    }

    cy.get('[data-cy="toast"]', { timeout: EXHAUSTION_TOAST_TIMEOUT_MS })
      .should("be.visible")
      .and("have.attr", "data-toast-type", "error");
    cy.get('[data-cy="toast-title"]').should(
      "contain",
      "Service temporarily unavailable",
    );
    cy.get('[data-cy="toast-body"]').should(
      "contain",
      "We couldn't load the latest data. Please try again later.",
    );
    cy.get("@serversSearchFail.all").should("have.length", 7);
  });

  it("shows toast after exhausted 500 retries on /servers/compare", () => {
    interceptSequence(
      "GET",
      COMPARE_SERVER_ROUTE,
      Array.from({ length: 7 }, () => ({ statusCode: 500 })),
      "compareServerFail",
    );

    clientNavigate(COMPARE_PATH);

    for (let i = 0; i < 7; i++) {
      cy.wait("@compareServerFail", { timeout: EXHAUSTION_TOAST_TIMEOUT_MS });
    }

    cy.get('[data-cy="toast"]', { timeout: EXHAUSTION_TOAST_TIMEOUT_MS })
      .should("be.visible")
      .and("have.attr", "data-toast-type", "error");
    cy.get('[data-cy="toast-title"]').should(
      "contain",
      "Service temporarily unavailable",
    );
    cy.get("@compareServerFail.all").should("have.length", 7);
  });

  it("shows toast after exhausted 500 retries on /databases", () => {
    interceptSequence(
      "GET",
      DATABASES_SEARCH_ROUTE,
      Array.from({ length: 7 }, () => ({ statusCode: 500 })),
      "databasesSearchFail",
    );

    clientNavigate("/databases");

    for (let i = 0; i < 7; i++) {
      cy.wait("@databasesSearchFail", { timeout: EXHAUSTION_TOAST_TIMEOUT_MS });
    }

    cy.get('[data-cy="toast"]', { timeout: EXHAUSTION_TOAST_TIMEOUT_MS })
      .should("be.visible")
      .and("have.attr", "data-toast-type", "error");
    cy.get('[data-cy="toast-title"]').should(
      "contain",
      "Service temporarily unavailable",
    );
    cy.get("@databasesSearchFail.all").should("have.length", 7);
  });

  it("shows toast after exhausted 500 retries on /databases/compare", () => {
    interceptSequence(
      "GET",
      COMPARE_DATABASE_ROUTE,
      Array.from({ length: 7 }, () => ({ statusCode: 500 })),
      "compareDatabaseFail",
    );

    clientNavigate(DATABASE_COMPARE_PATH);

    for (let i = 0; i < 7; i++) {
      cy.wait("@compareDatabaseFail", {
        timeout: EXHAUSTION_TOAST_TIMEOUT_MS,
      });
    }

    cy.get('[data-cy="toast"]', { timeout: EXHAUSTION_TOAST_TIMEOUT_MS })
      .should("be.visible")
      .and("have.attr", "data-toast-type", "error");
    cy.get('[data-cy="toast-title"]').should(
      "contain",
      "Service temporarily unavailable",
    );
    cy.get("@compareDatabaseFail.all").should("have.length", 7);
  });
});
