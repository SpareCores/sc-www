import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AnalyticsService } from "../../services/analytics.service";
import { AUTH_MESSAGES, AuthStateService } from "./index";
import { AuthFlowStore } from "./data-access/auth-flow-store.service";
import { ClerkService } from "./data-access/clerk.service";
import { GitHubService } from "./data-access/github.service";

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
      delete?: jasmine.Spy;
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
      openUserProfile: jasmine.createSpy("openUserProfile"),
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

    auth.openUserProfile();
    expect(clerk.openUserProfile).toHaveBeenCalled();
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
      openUserProfile: jasmine.Spy;
      signOut: jasmine.Spy;
      user: typeof signedInUser | null;
    } = {
      openUserProfile: jasmine.createSpy("openUserProfile"),
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: signedInUser,
    };
    setClerkInstance(clerk);
    setUser(auth, clerk.user);
    flowStore().rememberReturnUrl("/servers");
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
    spyOn(clerkService(), "requireSignIn").and.resolveTo({ create } as never);
    spyOn(clerkService(), "setActive").and.callFake(async () => {
      clerk.user = signedInUser;
    });
    spyOn(clerkService(), "reloadClient").and.resolveTo();
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
    spyOn(clerkService(), "requireSignIn").and.resolveTo({
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
    spyOn(clerkService(), "reloadClient").and.resolveTo();
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().rememberReturnUrl("/servers?tab=1#list");
    go("/auth/callback?intent=signIn");

    await expectAsync(auth.handleGitHubCallback()).toBeResolvedTo({
      status: "authenticated",
    });

    expect(redirect).toHaveBeenCalledWith(
      jasmine.objectContaining({ transferable: false }),
    );
    expect(navigate).toHaveBeenCalledOnceWith("/servers?tab=1#list", {
      replaceUrl: true,
    });
    expect(track).toHaveBeenCalledOnceWith("auth login", {});
    expect(auth.authInProgress()).toBeFalse();
    expect(auth.signUpModalOpen()).toBeFalse();
  });

  it("tracks GitHub registration separately from login", async () => {
    const auth = createAuth();
    const track = spyOn(analyticsService(), "trackEvent");
    setClerkInstance({
      user: { id: "user_2" },
      session: {},
      addListener: jasmine.createSpy("addListener"),
    });
    spyOn(clerkService(), "handleRedirectCallback").and.resolveTo();
    spyOn(clerkService(), "reloadClient").and.resolveTo();
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().rememberReturnUrl("/servers");
    go("/auth/callback?intent=signUp");

    await auth.handleGitHubCallback();

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
    spyOn(clerkService(), "reloadClient").and.resolveTo();
    spyOn(githubService(), "needsConsent").and.returnValue(true);
    const complete = spyOn(githubService(), "completeGitHubSignUp");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().rememberReturnUrl("/servers?tab=1#list");
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
    const complete = spyOn(githubService(), "completeGitHubSignUp");
    const abandon = spyOn(githubService(), "abandonIncompleteSignUp");
    const navigate = spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().rememberReturnUrl("/servers?tab=1#list");
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
    spyOn(clerkService(), "reloadClient").and.resolveTo();
    spyOn(githubService(), "needsConsent").and.returnValue(false);
    spyOn(router(), "navigateByUrl").and.resolveTo(true);
    flowStore().rememberReturnUrl("/servers");
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
    flowStore().rememberReturnUrl("/servers");
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
    flowStore().rememberReturnUrl("/servers");
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
    flowStore().rememberReturnUrl("/servers");
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
    spyOn(clerkService(), "reloadClient").and.resolveTo();
    let releaseNavigation: (value: boolean) => void = () => undefined;
    const navigate = spyOn(router(), "navigateByUrl").and.returnValue(
      new Promise<boolean>((resolve) => {
        releaseNavigation = resolve;
      }),
    );
    flowStore().rememberReturnUrl("/servers");
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
    flowStore().rememberReturnUrl("/servers");
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

  it("tracks account deletion only after a successful Clerk delete", async () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const trackSpy = spyOn(analytics, "trackEvent");
    const identifySpy = spyOn(analytics, "identify");
    const resetSpy = spyOn(analytics, "reset");
    const deleteSpy = jasmine.createSpy("delete").and.resolveTo(undefined);
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
      delete: deleteSpy,
    };
    setClerkInstance({ user: signedInUser });
    setUser(auth, signedInUser);

    await signedInUser.delete();
    setUser(auth, null);

    expect(deleteSpy).toHaveBeenCalled();
    expect(identifySpy).toHaveBeenCalledWith("user_1");
    expect(trackSpy).toHaveBeenCalledWith("auth account deleted", {});
    expect(resetSpy).toHaveBeenCalled();
  });

  it("does not track account deletion when Clerk delete fails", async () => {
    const auth = createAuth();
    const analytics = analyticsService();
    const trackSpy = spyOn(analytics, "trackEvent");
    const deleteSpy = jasmine
      .createSpy("delete")
      .and.rejectWith(new Error("delete failed"));
    const signedInUser = {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane",
      imageUrl: "",
      delete: deleteSpy,
    };
    setClerkInstance({ user: signedInUser });
    setUser(auth, signedInUser);

    await expectAsync(signedInUser.delete()).toBeRejectedWithError(
      "delete failed",
    );
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
