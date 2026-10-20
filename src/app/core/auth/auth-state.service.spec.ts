import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AnalyticsService } from "../../services/analytics.service";
import {
  GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
  GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
} from "../../services/toast-ids";
import { AuthFlowStore } from "./data-access/auth-flow-store.service";
import { ClerkService } from "./data-access/clerk.service";
import { GitHubService } from "./data-access/github.service";
import { AUTH_MESSAGES, AuthStateService } from "./index";

describe("AuthStateService", () => {
  let originalUrl = "/";

  beforeEach(() => {
    sessionStorage.clear();
    originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  });

  afterEach(() => {
    window.history.replaceState({}, "", originalUrl || "/");
    sessionStorage.clear();
  });

  function createAuth(platformId: string = "browser"): AuthStateService {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        provideRouter([]),
      ],
    });
    return TestBed.inject(AuthStateService);
  }

  function clerkService(): ClerkService {
    return TestBed.inject(ClerkService);
  }

  function analyticsService(): AnalyticsService {
    return TestBed.inject(AnalyticsService);
  }

  function setUser(
    auth: AuthStateService,
    user: {
      id?: string;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      imageUrl?: string | null;
    } | null,
  ): void {
    (
      auth as unknown as {
        setUser: (value: unknown) => void;
      }
    ).setUser(user);
  }

  function setClerkInstance(clerk: unknown, initResolved = true): void {
    const service = clerkService() as unknown as {
      clerk: unknown;
      initPromise: Promise<void> | null;
    };
    service.clerk = clerk;
    service.initPromise = initResolved ? Promise.resolve() : null;
  }

  it("should be created", () => {
    expect(createAuth()).toBeTruthy();
  });

  it("starts signed out with empty profile fields", () => {
    const auth = createAuth();

    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.userName()).toBe("");
    expect(auth.userImageUrl()).toBe("");
  });

  it("skips Clerk init outside the browser", async () => {
    const auth = createAuth("server");
    const errorSpy = spyOn(console, "error");

    await auth.init();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it("derives display name and image from the signed-in user", () => {
    const auth = createAuth();

    setUser(auth, {
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "https://example.com/avatar.png",
    });

    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.userName()).toBe("Jane Doe");
    expect(auth.userImageUrl()).toBe("https://example.com/avatar.png");
  });

  it("falls back to username when name parts are missing", () => {
    const auth = createAuth();

    setUser(auth, {
      firstName: null,
      lastName: null,
      username: "jane",
      imageUrl: "",
    });

    expect(auth.userName()).toBe("jane");
    expect(auth.userImageUrl()).toBe("");
  });

  it("opens custom auth modals when Clerk is available", () => {
    const auth = createAuth();
    const clerk = {
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: null,
    };
    setClerkInstance(clerk);

    auth.signIn();
    expect(auth.signInModalOpen()).toBeTrue();
    expect(auth.signUpModalOpen()).toBeFalse();

    auth.signUp();
    expect(auth.signUpModalOpen()).toBeTrue();
    expect(auth.signInModalOpen()).toBeFalse();
  });

  it("opens the profile modal only for signed-in users", () => {
    const auth = createAuth();

    auth.openUserProfile();
    expect(auth.profileModalOpen()).toBeFalse();

    setUser(auth, { id: "user_1", firstName: "Jane" });
    auth.openUserProfile();
    expect(auth.profileModalOpen()).toBeTrue();

    auth.closeUserProfile();
    expect(auth.profileModalOpen()).toBeFalse();
  });

  it("closes the profile modal when the user signs out", () => {
    const auth = createAuth();
    setUser(auth, { id: "user_1", firstName: "Jane" });
    auth.openUserProfile();

    setUser(auth, null);

    expect(auth.profileModalOpen()).toBeFalse();
  });

  it("reopens the profile modal after a GitHub connect redirect", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: { id: "user_1", firstName: "Jane" },
      session: { id: "sess_1" },
      addListener: jasmine.createSpy("addListener"),
    });
    go("/servers?profile=connected&tab=1");

    await auth.init();

    expect(auth.profileModalOpen()).toBeTrue();
    expect(`${window.location.pathname}${window.location.search}`).toBe(
      "/servers?tab=1",
    );
  });

  it("clears the remembered return URL when Login or Register is closed", () => {
    const auth = createAuth();
    setClerkInstance({ user: null });
    go("/servers?tab=1");

    auth.signIn();
    expect(sessionStorage.getItem("scAuthFlow")).toContain("/servers");
    auth.closeSignIn();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();

    go("/pricing");
    auth.signUp();
    expect(sessionStorage.getItem("scAuthFlow")).toContain("/pricing");
    auth.closeSignUp();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
  });

  it("clears auth state after sign out", async () => {
    const auth = createAuth();
    const signedInUser = {
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "https://example.com/avatar.png",
    };
    const clerk: {
      signOut: jasmine.Spy;
      user: typeof signedInUser | null;
    } = {
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: signedInUser,
    };
    setClerkInstance(clerk);
    setUser(auth, clerk.user);
    flowStore().setReturnUrl("/servers");
    flowStore().setGitHubIntent("signUp");
    flowStore().setPending(true);

    clerk.user = null;
    await auth.signOut();

    expect(clerk.signOut).toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.userName()).toBe("");
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
  });

  it("toasts when Clerk is not initialized on sign in or sign up", async () => {
    const auth = createAuth();
    const toastSpy = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );

    expect(() => auth.signIn()).not.toThrow();
    expect(() => auth.signUp()).not.toThrow();
    expect(auth.signInModalOpen()).toBeFalse();
    expect(auth.signUpModalOpen()).toBeFalse();
    expect(toastSpy).toHaveBeenCalledTimes(2);
    expect(toastSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: AUTH_MESSAGES.authUnavailable,
        type: "error",
      }),
    );
    expect(() => auth.openUserProfile()).not.toThrow();
    expect(auth.profileModalOpen()).toBeFalse();
    await expectAsync(auth.signOut()).toBeResolved();
  });

  it("returns null token outside the browser", async () => {
    const auth = createAuth("server");

    await expectAsync(auth.getToken()).toBeResolvedTo(null);
  });

  it("returns null token when Clerk session is unavailable", async () => {
    const auth = createAuth();
    setClerkInstance(null);

    await expectAsync(auth.getToken()).toBeResolvedTo(null);
  });

  it("returns the Clerk session token when available", async () => {
    const auth = createAuth();
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo("session-token");
    setClerkInstance({
      session: { getToken },
    });

    await expectAsync(auth.getToken()).toBeResolvedTo("session-token");
    expect(getToken).toHaveBeenCalledWith(undefined);
  });

  it("requests a named Clerk JWT template when provided", async () => {
    const auth = createAuth();
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo("keeper-token");
    setClerkInstance({
      session: { getToken },
    });

    await expectAsync(auth.getToken("keeper")).toBeResolvedTo("keeper-token");
    expect(getToken).toHaveBeenCalledWith({ template: "keeper" });
  });

  it("binds the Clerk listener only once across repeated init calls", async () => {
    const auth = createAuth();
    const addListener = jasmine.createSpy("addListener");
    setClerkInstance({
      addListener,
      user: null,
      session: null,
    });

    await auth.init();
    await auth.init();

    expect(addListener).toHaveBeenCalledTimes(1);
  });

  it("clears pending auth and user when clerk.signOut fails", async () => {
    const auth = createAuth();
    const clerk = {
      signOut: jasmine
        .createSpy("signOut")
        .and.rejectWith(new Error("sign-out failed")),
      user: {
        id: "user_1",
        firstName: "Jane",
        lastName: "Doe",
        username: "jane",
        imageUrl: "",
      },
      session: {},
    };
    setClerkInstance(clerk);
    setUser(auth, clerk.user);
    auth.startAuthPending();

    await expectAsync(auth.signOut()).toBeRejectedWithError("sign-out failed");

    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.authInProgress()).toBeFalse();
    expect(auth.userName()).toBe("");
  });

  function go(path: string): void {
    window.history.replaceState({}, "", path);
  }

  function flowStore(): AuthFlowStore {
    return TestBed.inject(AuthFlowStore);
  }

  function githubService(): GitHubService {
    return TestBed.inject(GitHubService);
  }

  function router(): Router {
    return TestBed.inject(Router);
  }

  it("returns to the remembered page after email login and clears the flow record", async () => {
    const auth = createAuth();
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    };
    const clerk = {
      user: null as typeof signedInUser | null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    };
    setClerkInstance(clerk);
    const create = jasmine.createSpy().and.resolveTo({
      status: "complete",
      createdSessionId: "sess_1",
    });
    spyOn(clerkService(), "getSignInResource").and.resolveTo({
      create,
    } as never);
    spyOn(clerkService(), "setActive").and.callFake(async () => {
      clerk.user = signedInUser;
    });
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    go("/servers?tab=1#list");

    auth.signIn();
    await auth.submitLogin({
      emailAddress: " ada@example.com ",
      password: "secret",
    });

    expect(create).toHaveBeenCalledWith({
      identifier: "ada@example.com",
      password: "secret",
    });
    expect(navigate).not.toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBeTrue();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
    expect(window.location.pathname).toBe("/servers");
  });

  it("clears pending auth when email login fails", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "getSignInResource").and.resolveTo({
      create: jasmine.createSpy().and.rejectWith(new Error("nope")),
    } as never);
    auth.startAuthPending();

    await expectAsync(
      auth.submitLogin({ emailAddress: "ada@example.com", password: "secret" }),
    ).toBeResolvedTo(
      jasmine.objectContaining({
        status: "error",
      }),
    );
    expect(auth.authInProgress()).toBeFalse();
  });

  function prepareSignIn(signIn: Record<string, unknown>): {
    setActive: jasmine.Spy;
  } {
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    };
    const clerk = {
      user: null as typeof signedInUser | null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    };
    setClerkInstance(clerk);
    spyOn(clerkService(), "getSignInResource").and.resolveTo(signIn as never);
    const setActive = spyOn(clerkService(), "setActive").and.callFake(
      async () => {
        clerk.user = signedInUser;
      },
    );
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    return { setActive };
  }

  const emailSecondFactor = {
    strategy: "email_code",
    emailAddressId: "idn_1",
  };

  const resetFirstFactor = {
    strategy: "reset_password_email_code",
    emailAddressId: "idn_1",
  };

  it("asks for a device code when login needs a second factor", async () => {
    const auth = createAuth();
    const prepareSecondFactor = jasmine
      .createSpy("prepareSecondFactor")
      .and.resolveTo({});
    prepareSignIn({
      create: jasmine
        .createSpy("create")
        .and.resolveTo({ status: "needs_second_factor" }),
      supportedSecondFactors: [emailSecondFactor],
      prepareSecondFactor,
    });

    await expectAsync(
      auth.submitLogin({ emailAddress: "ada@example.com", password: "secret" }),
    ).toBeResolvedTo({ status: "second_factor" });
    expect(prepareSecondFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      emailAddressId: "idn_1",
    });
  });

  it("asks for additional verification when no email second factor exists", async () => {
    const auth = createAuth();
    prepareSignIn({
      create: jasmine
        .createSpy("create")
        .and.resolveTo({ status: "needs_second_factor" }),
      supportedSecondFactors: [],
    });

    await expectAsync(
      auth.submitLogin({ emailAddress: "ada@example.com", password: "secret" }),
    ).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.additionalVerification,
    });
  });

  it("shows the Clerk message for a wrong password", async () => {
    const auth = createAuth();
    prepareSignIn({
      create: jasmine.createSpy("create").and.rejectWith({
        errors: [
          {
            code: "form_password_incorrect",
            longMessage: "Password is incorrect. Try again.",
          },
        ],
      }),
    });
    auth.startAuthPending();

    await expectAsync(
      auth.submitLogin({ emailAddress: "ada@example.com", password: "wrong" }),
    ).toBeResolvedTo({
      status: "error",
      message: "Password is incorrect. Try again.",
    });
    expect(auth.authInProgress()).toBeFalse();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it("returns authNotReady when Clerk has no sign-in resource", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "getSignInResource").and.resolveTo(null);

    await expectAsync(
      auth.submitLogin({ emailAddress: "ada@example.com", password: "secret" }),
    ).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.authNotReady,
    });
  });

  it("completes login with a trimmed device code", async () => {
    const auth = createAuth();
    const attemptSecondFactor = jasmine
      .createSpy("attemptSecondFactor")
      .and.resolveTo({ status: "complete", createdSessionId: "sess_1" });
    const { setActive } = prepareSignIn({ attemptSecondFactor });

    await expectAsync(
      auth.completeLoginSecondFactor(" 424242 "),
    ).toBeResolvedTo({ status: "complete" });
    expect(attemptSecondFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      code: "424242",
    });
    expect(setActive).toHaveBeenCalledWith("sess_1");
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it("rejects an incomplete or failed device code attempt", async () => {
    const auth = createAuth();
    const attemptSecondFactor = jasmine
      .createSpy("attemptSecondFactor")
      .and.resolveTo({ status: "needs_second_factor" });
    const { setActive } = prepareSignIn({ attemptSecondFactor });
    const expected = {
      status: "error" as const,
      message: AUTH_MESSAGES.unableToVerifyDeviceTrust,
    };

    await expectAsync(auth.completeLoginSecondFactor("1")).toBeResolvedTo(
      expected,
    );
    attemptSecondFactor.and.rejectWith(new Error(""));
    await expectAsync(auth.completeLoginSecondFactor("1")).toBeResolvedTo(
      expected,
    );
    expect(setActive).not.toHaveBeenCalled();
  });

  it("resends the device code", async () => {
    const auth = createAuth();
    const prepareSecondFactor = jasmine
      .createSpy("prepareSecondFactor")
      .and.resolveTo({});
    prepareSignIn({
      supportedSecondFactors: [emailSecondFactor],
      prepareSecondFactor,
    });

    await expectAsync(auth.resendLoginSecondFactor()).toBeResolvedTo({
      status: "second_factor",
    });
    prepareSecondFactor.and.rejectWith(new Error(""));
    await expectAsync(auth.resendLoginSecondFactor()).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToSendDeviceTrustCode,
    });
    expect(prepareSecondFactor).toHaveBeenCalledTimes(2);
  });

  it("starts a password reset with a trimmed email", async () => {
    const auth = createAuth();
    const create = jasmine.createSpy("create").and.resolveTo({});
    prepareSignIn({ create });

    await expectAsync(
      auth.startPasswordReset(" ada@example.com "),
    ).toBeResolvedTo({ status: "code_sent" });
    expect(create).toHaveBeenCalledWith({
      strategy: "reset_password_email_code",
      identifier: "ada@example.com",
    });
    create.and.rejectWith(new Error(""));
    await expectAsync(
      auth.startPasswordReset("ada@example.com"),
    ).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToSendResetCode,
    });
  });

  it("refuses password reset outside the browser", async () => {
    const auth = createAuth("server");

    await expectAsync(
      auth.startPasswordReset("ada@example.com"),
    ).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.passwordResetBrowserOnly,
    });
  });

  it("completes a password reset and signs in", async () => {
    const auth = createAuth();
    const attemptFirstFactor = jasmine
      .createSpy("attemptFirstFactor")
      .and.resolveTo({ status: "complete", createdSessionId: "sess_1" });
    const { setActive } = prepareSignIn({ attemptFirstFactor });

    await expectAsync(
      auth.completePasswordReset({ code: " 424242 ", password: "new-secret" }),
    ).toBeResolvedTo({ status: "complete" });
    expect(attemptFirstFactor).toHaveBeenCalledWith({
      strategy: "reset_password_email_code",
      code: "424242",
      password: "new-secret",
    });
    expect(setActive).toHaveBeenCalledWith("sess_1");
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it("rejects an incomplete password reset", async () => {
    const auth = createAuth();
    const { setActive } = prepareSignIn({
      attemptFirstFactor: jasmine
        .createSpy("attemptFirstFactor")
        .and.resolveTo({ status: "needs_first_factor" }),
    });

    await expectAsync(
      auth.completePasswordReset({ code: "1", password: "new-secret" }),
    ).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToResetPassword,
    });
    expect(setActive).not.toHaveBeenCalled();
  });

  it("resends the password reset code", async () => {
    const auth = createAuth();
    const prepareFirstFactor = jasmine
      .createSpy("prepareFirstFactor")
      .and.resolveTo({});
    prepareSignIn({
      supportedFirstFactors: [resetFirstFactor],
      prepareFirstFactor,
    });

    await expectAsync(auth.resendPasswordResetCode()).toBeResolvedTo({
      status: "code_sent",
    });
    expect(prepareFirstFactor).toHaveBeenCalledWith({
      strategy: "reset_password_email_code",
      emailAddressId: "idn_1",
    });
  });

  it("fails to resend the reset code without a reset factor", async () => {
    const auth = createAuth();
    const prepareFirstFactor = jasmine.createSpy("prepareFirstFactor");
    prepareSignIn({ supportedFirstFactors: [], prepareFirstFactor });

    await expectAsync(auth.resendPasswordResetCode()).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToResendResetCode,
    });
    expect(prepareFirstFactor).not.toHaveBeenCalled();
  });

  it("moves registration from details to consent", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const create = jasmine.createSpy("create").and.resolveTo({
      status: "missing_requirements",
      legalAcceptedAt: null,
      emailAddress: "ada@example.com",
      missingFields: [],
      unverifiedFields: ["email_address"],
    });
    spyOn(clerkService(), "getSignUpResource").and.resolveTo({
      id: null,
      create,
      verifications: {},
    } as never);

    await expectAsync(
      auth.startRegister({
        firstName: "Ada",
        lastName: "Lovelace",
        emailAddress: " ada@example.com ",
        password: "secret",
      }),
    ).toBeResolvedTo({ status: "consent" });

    expect(create).toHaveBeenCalledWith({
      firstName: "Ada",
      lastName: "Lovelace",
      emailAddress: "ada@example.com",
      password: "secret",
    });
  });

  it("moves registration from consent to email verification", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const prepareEmailAddressVerification = jasmine
      .createSpy("prepareEmailAddressVerification")
      .and.resolveTo({});
    const update = jasmine.createSpy("update").and.resolveTo({
      status: "missing_requirements",
      legalAcceptedAt: 1,
      emailAddress: "ada@example.com",
      missingFields: [],
      unverifiedFields: ["email_address"],
      prepareEmailAddressVerification,
    });
    spyOn(clerkService(), "getSignUpResource").and.resolveTo({
      update,
    } as never);

    await expectAsync(
      auth.completeRegister({
        legalAccepted: true,
        newsletterOptIn: false,
      }),
    ).toBeResolvedTo({ status: "verify" });

    expect(update).toHaveBeenCalledWith({
      legalAccepted: true,
      unsafeMetadata: undefined,
    });
    expect(prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    });
  });

  it("activates a session after successful email verification", async () => {
    const auth = createAuth();
    const signedInUser = {
      id: "user_1",
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada",
      imageUrl: "",
    };
    const clerk = {
      user: null as typeof signedInUser | null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    };
    setClerkInstance(clerk);
    spyOn(clerkService(), "getSignUpResource").and.resolveTo({
      missingFields: [],
      attemptEmailAddressVerification: jasmine.createSpy().and.resolveTo({
        status: "complete",
        createdSessionId: "sess_reg",
        missingFields: [],
      }),
    } as never);
    spyOn(clerkService(), "setActive").and.callFake(async () => {
      clerk.user = signedInUser;
    });
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    const track = spyOn(analyticsService(), "trackEvent");
    go("/servers");

    await expectAsync(auth.verifyRegister("424242")).toBeResolvedTo({
      status: "complete",
    });

    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.authInProgress()).toBeFalse();
    expect(track).toHaveBeenCalledOnceWith("auth register", {});
    expect(navigate).not.toHaveBeenCalled();
  });

  it("resends the registration verification code", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const prepareEmailAddressVerification = jasmine
      .createSpy("prepareEmailAddressVerification")
      .and.resolveTo({});
    spyOn(clerkService(), "getSignUpResource").and.resolveTo({
      missingFields: [],
      prepareEmailAddressVerification,
    } as never);

    await expectAsync(auth.resendRegisterCode()).toBeResolvedTo({
      status: "verify",
    });
    expect(prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    });
  });

  it("returns a registration error message without toasting", async () => {
    const auth = createAuth();
    const toast = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "getSignUpResource").and.resolveTo({
      id: null,
      create: jasmine.createSpy("create").and.rejectWith({
        errors: [
          {
            longMessage: "Email is taken",
            meta: { paramName: "emailAddress" },
          },
        ],
      }),
      verifications: {},
    } as never);

    await expectAsync(
      auth.startRegister({
        firstName: "Ada",
        lastName: "Lovelace",
        emailAddress: "ada@example.com",
        password: "secret",
      }),
    ).toBeResolvedTo({
      status: "error",
      message: "Email is taken",
      param: "emailAddress",
    });
    expect(toast).not.toHaveBeenCalled();
  });

  it("returns to bookmarks after GitHub auth when that return URL is stored", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/bookmarks");
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(navigate).toHaveBeenCalledOnceWith("/bookmarks", {
      replaceUrl: true,
    });
    expect(auth.authInProgress()).toBeFalse();
  });

  it("redirects away from bookmarks after sign-out", async () => {
    const auth = createAuth();
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    };
    setClerkInstance({
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: signedInUser,
    });
    setUser(auth, signedInUser);
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    go("/bookmarks");

    await auth.signOut();

    expect(navigate).toHaveBeenCalledOnceWith("/");
  });

  it("clears a failed GitHub sign-in redirect", async () => {
    const auth = createAuth();
    setClerkInstance({ user: null, addListener: jasmine.createSpy() });
    go("/pricing");
    spyOn(githubService(), "startSignIn").and.resolveTo({
      status: "error",
      message: "Denied",
    });

    await expectAsync(auth.signInWithGitHub()).toBeRejectedWithError("Denied");

    expect(auth.authInProgress()).toBeFalse();
    expect(flowStore().githubIntent()).toBeNull();
  });

  it("signs in from the GitHub callback and returns to the original URL", async () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const track = spyOn(analytics, "trackEvent");
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    };
    setClerkInstance({
      user: signedInUser,
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers?tab=1#list");
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(redirect).toHaveBeenCalledWith({
      transferable: false,
      origin: window.location.origin,
      afterAuthUrl: `${window.location.origin}/servers?tab=1#list`,
    });
    expect(navigate).toHaveBeenCalledOnceWith("/servers?tab=1#list", {
      replaceUrl: true,
    });
    expect(track).toHaveBeenCalledOnceWith("auth login", {});
    expect(auth.authInProgress()).toBeFalse();
    expect(auth.signUpModalOpen()).toBeFalse();
  });

  it("removes compare-limit toasts after a successful GitHub login", async () => {
    const auth = createAuth();
    const removeToast = spyOn(
      (
        auth as unknown as {
          toastService: { removeToast: (id: string) => void };
        }
      ).toastService,
      "removeToast",
    );
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.callFake(async () => {
      expect(removeToast).toHaveBeenCalledWith(
        GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
      );
      expect(removeToast).toHaveBeenCalledWith(
        GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
      );
      return true;
    });
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(navigate).toHaveBeenCalledOnceWith("/servers", { replaceUrl: true });
  });

  it("removes compare-limit toasts after a successful GitHub registration", async () => {
    const auth = createAuth();
    const removeToast = spyOn(
      (
        auth as unknown as {
          toastService: { removeToast: (id: string) => void };
        }
      ).toastService,
      "removeToast",
    );
    setClerkInstance({
      user: { id: "user_2" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?intent=signUp");

    await auth.handleGitHubCallback();

    expect(removeToast).toHaveBeenCalledWith(
      GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
    );
    expect(removeToast).toHaveBeenCalledWith(
      GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
    );
  });

  it("tracks GitHub registration separately from login", async () => {
    const auth = createAuth();
    const track = spyOn(analyticsService(), "trackEvent");
    setClerkInstance({
      user: { id: "user_2" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?intent=signUp");

    await auth.handleGitHubCallback();

    expect(redirect).toHaveBeenCalledWith({
      transferable: true,
      origin: window.location.origin,
      afterAuthUrl: `${window.location.origin}/servers`,
    });
    expect(navigate).toHaveBeenCalledOnceWith("/servers", { replaceUrl: true });
    expect(track).toHaveBeenCalledOnceWith("auth register", {});
  });

  it("opens GitHub consent without completing sign-up when terms are still required", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    spyOn(githubService(), "needsConsent").and.returnValue(true);
    const complete = spyOn(githubService(), "submitConsentAndComplete");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers?tab=1#list");
    go("/auth/callback?intent=signUp");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "needs_consent",
    });

    expect(complete).not.toHaveBeenCalled();
    expect(auth.githubConsentActive()).toBeTrue();
    expect(auth.signUpModalOpen()).toBeTrue();
    expect(navigate).toHaveBeenCalledOnceWith("/servers?tab=1#list", {
      replaceUrl: true,
    });
    expect(flowStore().githubIntent()).toBe("signUp");
  });

  it("does not force a Clerk redirect when no return URL is stored", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(redirect).toHaveBeenCalledWith({
      transferable: false,
      origin: window.location.origin,
      afterAuthUrl: undefined,
    });
  });

  it("does not force a Clerk redirect for an unsafe stored return URL", async () => {
    sessionStorage.setItem(
      "scAuthFlow",
      JSON.stringify({
        pending: true,
        returnUrl: "https://evil.example",
        githubIntent: "signIn",
      }),
    );
    const auth = createAuth();
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(redirect).toHaveBeenCalledWith({
      transferable: false,
      origin: window.location.origin,
      afterAuthUrl: undefined,
    });
  });

  it("persists GitHub consent opened from the registration flow", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(githubService(), "continueSignUp").and.resolveTo({
      status: "needs_consent",
    });
    go("/servers");

    await expectAsync(auth.submitGitHubConsent(false, false)).toBeResolvedTo({
      status: "consent",
    });

    expect(auth.githubConsentActive()).toBeTrue();
    expect(auth.signUpModalOpen()).toBeTrue();
    expect(flowStore().githubIntent()).toBe("signUp");
  });

  it("keeps incomplete GitHub consent across init without auto-opening the modal", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(githubService(), "needsConsent").and.returnValue(true);
    flowStore().setGitHubIntent("signUp");
    flowStore().setPending(true);
    go("/servers");

    await auth.init();

    expect(auth.signUpModalOpen()).toBeFalse();
    expect(auth.githubConsentActive()).toBeFalse();
    expect(auth.authInProgress()).toBeFalse();
    expect(flowStore().githubIntent()).toBe("signUp");

    auth.signUp();

    expect(auth.signUpModalOpen()).toBeTrue();
    expect(auth.githubConsentActive()).toBeTrue();
  });

  it("toasts when GitHub authorization is cancelled and does not open ToS", async () => {
    const auth = createAuth();
    const toast = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(githubService(), "needsConsent").and.returnValue(true);
    const complete = spyOn(githubService(), "submitConsentAndComplete");
    const abandon = spyOn(githubService(), "resetSignUpState");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers?tab=1#list");
    flowStore().setGitHubIntent("signUp");
    flowStore().setPending(true);
    go("/auth/callback?error=access_denied");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "cancelled",
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(abandon).toHaveBeenCalled();
    expect(auth.githubConsentActive()).toBeFalse();
    expect(auth.signUpModalOpen()).toBeFalse();
    expect(auth.authInProgress()).toBeFalse();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
    expect(navigate).toHaveBeenCalledOnceWith("/servers?tab=1#list", {
      replaceUrl: true,
    });
    expect(toast).toHaveBeenCalledWith({
      title: AUTH_MESSAGES.githubAuthorizationDenied,
      type: "error",
    });
  });

  it("treats a GitHub callback without a session or error as authorization denial", async () => {
    const auth = createAuth();
    const toast = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    spyOn(githubService(), "needsConsent").and.returnValue(false);
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?intent=signUp");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "cancelled",
    });

    expect(auth.signUpModalOpen()).toBeFalse();
    expect(auth.authInProgress()).toBeFalse();
    expect(toast).toHaveBeenCalledWith({
      title: AUTH_MESSAGES.githubAuthorizationDenied,
      type: "error",
    });
  });

  it("clears GitHub state after a non-cancel callback error", async () => {
    const auth = createAuth();
    const toast = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go(
      "/auth/callback?error=server_error&error_description=GitHub%20is%20down",
    );

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "error",
      message: "GitHub is down",
    });

    expect(auth.signUpModalOpen()).toBeFalse();
    expect(auth.authInProgress()).toBeFalse();
    expect(navigate).toHaveBeenCalledOnceWith("/servers", { replaceUrl: true });
    expect(toast).toHaveBeenCalledWith({
      title: "GitHub is down",
      type: "error",
    });
  });

  it("falls back to a generic GitHub message when the callback error has none", async () => {
    const auth = createAuth();
    const toast = spyOn(
      (
        auth as unknown as {
          toastService: { show: (options: unknown) => void };
        }
      ).toastService,
      "show",
    );
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?error=server_error");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToContinueGitHub,
    });

    expect(toast).toHaveBeenCalledWith({
      title: AUTH_MESSAGES.unableToContinueGitHub,
      type: "error",
    });
  });

  it("rejects a GitHub callback with no intent instead of guessing sign-up", async () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(clerkService(), "handleRedirectCallback");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().setReturnUrl("/servers");
    go("/auth/callback");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "error",
      message: AUTH_MESSAGES.unableToContinueGitHub,
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledOnceWith("/servers", { replaceUrl: true });
  });

  it("finalizes an authenticated GitHub callback once", async () => {
    const auth = createAuth();
    const track = spyOn(analyticsService(), "trackEvent");
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    const redirect = spyOn(
      clerkService(),
      "handleRedirectCallback",
    ).and.resolveTo();
    spyOn(clerkService(), "syncClerkState").and.resolveTo();
    let releaseNavigation: (value: boolean) => void = () => undefined;
    const navigate = spyOn(router(), "navigateByUrl").and.returnValue(
      new Promise<boolean>((resolve) => {
        releaseNavigation = resolve;
      }),
    );
    flowStore().setReturnUrl("/servers");
    go("/auth/callback?intent=signIn");

    const first = auth.handleGitHubCallback();
    const second = auth.handleGitHubCallback();
    for (let i = 0; i < 30; i += 1) {
      await Promise.resolve();
    }
    releaseNavigation(true);

    await expectAsync(first).toBeResolvedTo({ status: "authenticated" });
    await expectAsync(second).toBeResolvedTo({ status: "authenticated" });
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledOnceWith("auth login", {});
  });

  it("clears stale pending state without tracking another login", async () => {
    const auth = createAuth();
    const track = spyOn(analyticsService(), "trackEvent");
    setClerkInstance({
      user: { id: "user_1" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    flowStore().setReturnUrl("/servers");
    flowStore().setGitHubIntent("signIn");
    flowStore().setPending(true);
    go("/servers");

    await auth.init();

    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.authInProgress()).toBeFalse();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
    expect(track).not.toHaveBeenCalled();
  });

  it("does not navigate when the Clerk listener only synchronizes the user", async () => {
    const auth = createAuth();
    let listener: (() => void) | undefined;
    const clerk = {
      user: null as { id: string } | null,
      session: null,
      addListener: jasmine
        .createSpy("addListener")
        .and.callFake((callback: () => void) => {
          listener = callback;
        }),
    };
    setClerkInstance(clerk);
    go("/servers");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);

    await auth.init();
    clerk.user = { id: "user_1" };
    listener?.();

    expect(auth.isAuthenticated()).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("resets analytics on sign out without tracking account deletion", async () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const trackSpy = spyOn(analytics, "trackEvent");
    const resetSpy = spyOn(analytics, "reset");
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    };
    const clerk = {
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: signedInUser as typeof signedInUser | null,
    };
    setClerkInstance(clerk);
    setUser(auth, signedInUser);

    clerk.user = null;
    await auth.signOut();

    expect(resetSpy).toHaveBeenCalled();
    expect(trackSpy).not.toHaveBeenCalledWith("auth account deleted", {});
  });

  it("tracks account deletion when the deletion is marked", () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const trackSpy = spyOn(analytics, "trackEvent");
    const identifySpy = spyOn(analytics, "identify");
    const resetSpy = spyOn(analytics, "reset");
    setUser(auth, {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    });

    auth.markAccountDeleted(true);
    setUser(auth, null);

    expect(identifySpy).toHaveBeenCalledWith("user_1");
    expect(trackSpy).toHaveBeenCalledWith("auth account deleted", {});
    expect(resetSpy).toHaveBeenCalled();
  });

  it("redirects away from bookmarks after account deletion", () => {
    const auth = createAuth();
    spyOn(analyticsService(), "trackEvent");
    setUser(auth, {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    });
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    go("/bookmarks");

    auth.markAccountDeleted(true);
    setUser(auth, null);

    expect(navigate).toHaveBeenCalledOnceWith("/");
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it("does not track account deletion when the mark is cleared", () => {
    const auth = createAuth();
    const trackSpy = spyOn(analyticsService(), "trackEvent");
    setUser(auth, {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    });

    auth.markAccountDeleted(true);
    auth.markAccountDeleted(false);
    setUser(auth, null);

    expect(trackSpy).not.toHaveBeenCalledWith("auth account deleted", {});
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it("resets analytics when the user disappears without explicit deletion", () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const trackSpy = spyOn(analytics, "trackEvent");
    const resetSpy = spyOn(analytics, "reset");
    setUser(auth, {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
    });

    setUser(auth, null);

    expect(resetSpy).toHaveBeenCalled();
    expect(trackSpy).not.toHaveBeenCalledWith("auth account deleted", {});
  });
});
