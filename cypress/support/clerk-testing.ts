import { setupClerkTestingToken } from "@clerk/testing/cypress";

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

  setupClerkTestingToken();
}
