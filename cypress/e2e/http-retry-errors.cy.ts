import { E2EEvent } from "../support/generics";

// Match Keeper API only — never the Angular document on :4200.
const SERVERS_SEARCH_ROUTE =
  /^https?:\/\/(?!localhost:4200(?:\/|$))[^/]+\/servers(?:\?.*)?$/;
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
    let anchorUrl: string | undefined;
    let anchorAttempts = 0;

    cy.intercept({ method: "GET", url: SERVERS_SEARCH_ROUTE }, (req) => {
      if (anchorUrl === undefined) {
        anchorUrl = req.url;
      }

      if (req.url === anchorUrl) {
        anchorAttempts += 1;
        if (anchorAttempts === 1) {
          req.reply({ statusCode: 408, body: "" });
          return;
        }
      }

      req.continue();
    }).as("serversSearch");

    clientNavigate("/servers");

    cy.wait("@serversSearch", { timeout: API_WAIT_MS })
      .its("response.statusCode")
      .should("eq", 408);
    cy.wait("@serversSearch", { timeout: API_WAIT_MS })
      .its("response.statusCode")
      .should("be.within", 200, 299);
    // First /servers URL must be retried (408 → another attempt). Listing URL
    // sync may issue extra searches, so total intercepts can exceed 2.
    cy.wrap(null).should(() => {
      expect(anchorAttempts).to.be.at.least(2);
    });
    cy.get("#servers_table").should("exist");
  });

  it("retries 429 with Retry-After: 0 then loads /servers", () => {
    let anchorUrl: string | undefined;
    let anchorAttempts = 0;

    cy.intercept({ method: "GET", url: SERVERS_SEARCH_ROUTE }, (req) => {
      if (anchorUrl === undefined) {
        anchorUrl = req.url;
      }

      if (req.url === anchorUrl) {
        anchorAttempts += 1;
        if (anchorAttempts === 1) {
          req.reply({
            statusCode: 429,
            body: "",
            headers: { "Retry-After": "0" },
          });
          return;
        }
      }

      req.continue();
    }).as("serversSearch429");

    clientNavigate("/servers");

    cy.wait("@serversSearch429", { timeout: API_WAIT_MS })
      .its("response.statusCode")
      .should("eq", 429);
    cy.wait("@serversSearch429", { timeout: API_WAIT_MS })
      .its("response.statusCode")
      .should("be.within", 200, 299);
    cy.wrap(null).should(() => {
      expect(anchorAttempts).to.be.at.least(2);
    });
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
});
