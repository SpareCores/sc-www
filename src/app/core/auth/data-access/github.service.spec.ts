import { TestBed } from "@angular/core/testing";
import { AUTH_MESSAGES } from "../auth.constants";
import { ClerkService } from "./clerk.service";
import { GitHubService } from "./github.service";

describe("GitHubService", () => {
  function createService(clerk: Record<string, unknown>): GitHubService {
    TestBed.configureTestingModule({
      providers: [{ provide: ClerkService, useValue: clerk }],
    });
    return TestBed.inject(GitHubService);
  }

  it("detects when GitHub still needs terms acceptance", () => {
    const github = createService({
      user: null,
      instance: {
        client: {
          signIn: { firstFactorVerification: { status: "transferable" } },
          signUp: null,
        },
      },
    });

    expect(github.needsConsent()).toBeTrue();
  });

  it("starts GitHub sign-in with an explicit callback intent", async () => {
    const authenticateWithRedirect = jasmine
      .createSpy()
      .and.resolveTo(undefined);
    const github = createService({
      requireSignIn: jasmine.createSpy().and.resolveTo({
        authenticateWithRedirect,
      }),
    });

    await expectAsync(github.startSignIn()).toBeResolvedTo({
      status: "redirecting",
    });
    expect(authenticateWithRedirect).toHaveBeenCalledWith(
      jasmine.objectContaining({
        strategy: "oauth_github",
        redirectUrl: jasmine.stringMatching(/\/auth\/callback\?intent=signIn$/),
        redirectUrlComplete: jasmine.stringMatching(
          /\/auth\/callback\?intent=signIn$/,
        ),
      }),
    );
  });

  it("returns a redirect error without throwing", async () => {
    const github = createService({
      requireSignIn: jasmine.createSpy().and.resolveTo({
        authenticateWithRedirect: jasmine
          .createSpy()
          .and.rejectWith({ errors: [{ message: "Denied" }] }),
      }),
    });

    await expectAsync(github.startSignIn()).toBeResolvedTo({
      status: "error",
      message: "Denied",
    });
  });

  it("starts GitHub sign-up with consent metadata and callback intent", async () => {
    const authenticateWithRedirect = jasmine
      .createSpy()
      .and.resolveTo(undefined);
    const signUp = {
      id: "su_1",
      authenticateWithRedirect,
    };
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo(signUp),
    });

    await expectAsync(github.continueSignUp(true, true)).toBeResolvedTo({
      status: "redirecting",
    });
    expect(authenticateWithRedirect).toHaveBeenCalledWith(
      jasmine.objectContaining({
        redirectUrl: jasmine.stringMatching(/\/auth\/callback\?intent=signUp$/),
        continueSignUp: true,
        legalAccepted: true,
        unsafeMetadata: { newsletterOptIn: true },
      }),
    );
  });

  it("returns consent when a transferable sign-in needs registration terms", async () => {
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({
        firstFactorVerification: { status: "transferable" },
      }),
      requireSignUp: jasmine.createSpy().and.resolveTo({ id: "su_1" }),
    });

    await expectAsync(github.continueSignUp(false, false)).toBeResolvedTo({
      status: "needs_consent",
    });
  });

  it("returns consent when verified GitHub OAuth still needs terms", async () => {
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo({
        id: "su_1",
        legalAcceptedAt: null,
        verifications: { externalAccount: { status: "verified" } },
      }),
    });

    await expectAsync(github.continueSignUp(false, false)).toBeResolvedTo({
      status: "needs_consent",
    });
  });

  it("completes a transferable GitHub account as a login session", async () => {
    const create = jasmine.createSpy().and.resolveTo({
      status: "complete",
      createdSessionId: "sess_1",
    });
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({ create }),
      requireSignUp: jasmine.createSpy().and.resolveTo({
        id: "su_1",
        verifications: { externalAccount: { status: "transferable" } },
      }),
    });

    await expectAsync(github.completeGitHubSignUp(false, true)).toBeResolvedTo({
      status: "complete",
      sessionId: "sess_1",
      kind: "login",
    });
    expect(create).toHaveBeenCalledWith({ transfer: true });
  });

  it("reports additional verification when a transferred sign-in needs it", async () => {
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({
        create: jasmine.createSpy().and.resolveTo({
          status: "needs_second_factor",
        }),
      }),
      requireSignUp: jasmine.createSpy().and.resolveTo({
        id: "su_1",
        verifications: { externalAccount: { status: "transferable" } },
      }),
    });

    await expectAsync(github.completeGitHubSignUp(false, true)).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.additionalVerification,
    });
  });

  it("abandons a GitHub sign-up that can no longer be completed", async () => {
    const resetSignUp = jasmine.createSpy("resetSignUp");
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo({ id: null }),
      instance: { client: { resetSignUp } },
    });

    await expectAsync(github.completeGitHubSignUp(false, true)).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToCompleteGitHubSignUp,
    });
    expect(resetSignUp).toHaveBeenCalled();
  });

  it("continues an unverified GitHub OAuth attempt with another redirect", async () => {
    const authenticateWithRedirect = jasmine
      .createSpy()
      .and.resolveTo(undefined);
    const signUp = {
      id: "su_1",
      verifications: { externalAccount: { status: "unverified" } },
      authenticateWithRedirect,
    };
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo(signUp),
    });

    await expectAsync(github.completeGitHubSignUp(false, true)).toBeResolvedTo({
      status: "redirecting",
    });
    expect(authenticateWithRedirect).toHaveBeenCalledWith(
      jasmine.objectContaining({
        redirectUrl: jasmine.stringMatching(/\/auth\/callback\?intent=signUp$/),
        legalAccepted: true,
      }),
    );
  });

  it("returns a registration session after legal acceptance", async () => {
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo({
        id: "su_1",
        status: "missing_requirements",
        verifications: { externalAccount: { status: "verified" } },
        update: jasmine.createSpy().and.resolveTo({
          status: "complete",
          createdSessionId: "sess_reg",
        }),
      }),
    });

    await expectAsync(github.completeGitHubSignUp(false, true)).toBeResolvedTo({
      status: "complete",
      sessionId: "sess_reg",
      kind: "registration",
    });
  });

  it("abandons the sign-up when Clerk rejects completion", async () => {
    const resetSignUp = jasmine.createSpy("resetSignUp");
    const github = createService({
      reloadClient: jasmine.createSpy().and.resolveTo(undefined),
      requireSignIn: jasmine.createSpy().and.resolveTo({}),
      requireSignUp: jasmine.createSpy().and.resolveTo({
        id: "su_1",
        status: "missing_requirements",
        verifications: { externalAccount: { status: "verified" } },
        update: jasmine.createSpy().and.rejectWith(new Error("boom")),
      }),
      instance: { client: { resetSignUp } },
    });

    await expectAsync(github.completeGitHubSignUp(true, true)).toBeResolvedTo({
      status: "error",
      message: "boom",
    });
    expect(resetSignUp).toHaveBeenCalled();
  });
});
