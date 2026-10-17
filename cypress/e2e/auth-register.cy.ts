import {
  clerkTestEmail,
  deleteClerkTestUser,
  randomClerkTestPassword,
  registerClerkTestUser,
  skipWithoutClerk,
} from "../support/clerk-testing";

describe("Clerk +clerk_test registration", () => {
  const email = clerkTestEmail("register");

  skipWithoutClerk();

  after(() => {
    deleteClerkTestUser(email);
  });

  it("registers through details, consent, and email verification", () => {
    registerClerkTestUser(email, randomClerkTestPassword());
  });
});
