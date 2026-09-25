import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AnalyticsService } from "../../services/analytics.service";
import { AUTH_MESSAGES, AuthStateService, ClerkService } from "./index";

describe("AuthStateService", () => {
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
    auth.setUser(user as never);
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

    clerk.user = null;
    await auth.signOut();

    expect(clerk.signOut).toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.userName()).toBe("");
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

  it("returns error when GitHub callback has no user and no consent need", () => {
    const auth = createAuth();
    setClerkInstance({
      user: null,
      session: null,
    });
    spyOn(auth, "needsGithubConsent").and.returnValue(false);

    expect(auth.resolveGithubCallbackOutcome()).toBe("error");
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
    auth.setUser(null);

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
    auth.setUser(null);

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

    auth.setUser(null);

    expect(resetSpy).toHaveBeenCalled();
    expect(trackSpy).not.toHaveBeenCalledWith("auth account deleted", {});
  });
});
