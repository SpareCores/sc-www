import {
  canResumeEmailVerification,
  clerkAuthError,
  isPendingGitHubExternalComplete,
  isSecondFactorStatus,
  isTransferable,
  needsGitHubConsent,
  needsLegalAcceptance,
  newsletterMetadata,
  pendingEmailVerification,
} from "./auth.utils";

describe("auth utils", () => {
  it("detects transferable Clerk resources", () => {
    expect(isTransferable(null)).toBeFalse();
    expect(isTransferable({ isTransferable: true } as never)).toBeTrue();
    expect(
      isTransferable({
        verifications: { externalAccount: { status: "transferable" } },
      } as never),
    ).toBeTrue();
    expect(
      isTransferable({
        firstFactorVerification: { status: "transferable" },
      } as never),
    ).toBeTrue();
    expect(
      isTransferable({
        verifications: { externalAccount: { status: "verified" } },
      } as never),
    ).toBeFalse();
  });

  it("detects second-factor statuses", () => {
    expect(isSecondFactorStatus("needs_second_factor")).toBeTrue();
    expect(isSecondFactorStatus("needs_client_trust")).toBeTrue();
    expect(isSecondFactorStatus("complete")).toBeFalse();
  });

  it("detects a verified GitHub account that still needs legal acceptance", () => {
    expect(isPendingGitHubExternalComplete(null)).toBeFalse();
    expect(
      isPendingGitHubExternalComplete({
        verifications: { externalAccount: { status: "verified" } },
      } as never),
    ).toBeTrue();
    expect(
      isPendingGitHubExternalComplete({
        verifications: { externalAccount: { status: "unverified" } },
      } as never),
    ).toBeFalse();
    expect(needsLegalAcceptance(null)).toBeFalse();
    expect(needsLegalAcceptance({ legalAcceptedAt: null } as never)).toBeTrue();
    expect(needsLegalAcceptance({ legalAcceptedAt: 1 } as never)).toBeFalse();
  });

  it("requires GitHub consent only for an unsigned-in transferable or unfinished external sign-up", () => {
    const verifiedSignUp = {
      legalAcceptedAt: null,
      verifications: { externalAccount: { status: "verified" } },
    };
    const transferableSignIn = {
      firstFactorVerification: { status: "transferable" },
    };

    expect(
      needsGitHubConsent(transferableSignIn as never, null, true),
    ).toBeFalse();
    expect(
      needsGitHubConsent(
        null,
        {
          verifications: { externalAccount: { status: "transferable" } },
        } as never,
        false,
      ),
    ).toBeFalse();
    expect(
      needsGitHubConsent(transferableSignIn as never, null, false),
    ).toBeTrue();
    expect(
      needsGitHubConsent(
        null,
        {
          emailAddress: "ada@example.com",
          unverifiedFields: ["email_address"],
          verifications: { externalAccount: { status: "verified" } },
          legalAcceptedAt: null,
        } as never,
        false,
      ),
    ).toBeFalse();
    expect(needsGitHubConsent(null, verifiedSignUp as never, false)).toBeTrue();
    expect(
      needsGitHubConsent(
        null,
        { ...verifiedSignUp, legalAcceptedAt: 1 } as never,
        false,
      ),
    ).toBeFalse();
    expect(needsGitHubConsent(null, null, false)).toBeFalse();
  });

  it("resumes email verification only for the same address after legal acceptance", () => {
    const signUp = {
      emailAddress: "Ada@Example.com",
      unverifiedFields: ["email_address"],
      legalAcceptedAt: 1,
      missingFields: [],
    };

    expect(pendingEmailVerification(signUp as never)).toBe("Ada@Example.com");
    expect(
      canResumeEmailVerification(signUp as never, "ada@example.com"),
    ).toBeTrue();
    expect(
      canResumeEmailVerification(signUp as never, "other@example.com"),
    ).toBeFalse();
    expect(
      canResumeEmailVerification(
        { ...signUp, missingFields: ["password"] } as never,
        "ada@example.com",
      ),
    ).toBeFalse();
    expect(
      canResumeEmailVerification(
        { ...signUp, legalAcceptedAt: null } as never,
        "ada@example.com",
      ),
    ).toBeFalse();
  });

  it("reads Clerk field errors and newsletter metadata", () => {
    expect(
      clerkAuthError(
        {
          errors: [
            {
              longMessage: "Taken",
              meta: { paramName: "email_address" },
            },
          ],
        },
        "fallback",
      ),
    ).toEqual({ message: "Taken", paramName: "email_address" });
    expect(clerkAuthError(null, "fallback")).toEqual({ message: "fallback" });
    expect(newsletterMetadata(false)).toBeUndefined();
    expect(newsletterMetadata(true)).toEqual({ newsletterOptIn: true });
  });
});
