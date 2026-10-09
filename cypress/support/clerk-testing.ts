const TESTING_TOKEN_PARAM = "__clerk_testing_token";

export function randomClerkTestPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `Aa1!${token}`;
}

export function bypassClerkBotProtection(): void {
  const fapi = Cypress.env("CLERK_FAPI") as string | undefined;
  const token = Cypress.env("CLERK_TESTING_TOKEN") as string | undefined;

  if (!fapi || !token) {
    throw new Error(
      `Clerk testing env missing (CLERK_FAPI=${Boolean(fapi)}, CLERK_TESTING_TOKEN=${Boolean(token)}). Ensure clerkSetup ran with NG_APP_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.`,
    );
  }

  cy.intercept(`https://${fapi}/v1/**`, (req) => {
    const url = new URL(req.url);
    url.searchParams.set(TESTING_TOKEN_PARAM, token);
    req.url = url.toString();

    req.continue((res) => {
      if (!res.body || typeof res.body !== "object") {
        return;
      }

      const body = res.body as {
        response?: { captcha_bypass?: boolean };
        client?: { captcha_bypass?: boolean };
      };

      if (body.response && typeof body.response === "object") {
        body.response.captcha_bypass = true;
      }
      if (body.client && typeof body.client === "object") {
        body.client.captcha_bypass = true;
      }
    });
  });
}
