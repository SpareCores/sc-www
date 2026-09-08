import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Auth } from "./auth";

describe("Auth", () => {
  function createAuth(platformId: string = "browser"): Auth {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        provideRouter([]),
      ],
    });
    return TestBed.inject(Auth);
  }

  function setUser(
    auth: Auth,
    user: {
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      imageUrl?: string | null;
    } | null,
  ): void {
    (auth as unknown as { _user: { set: (value: unknown) => void } })._user.set(
      user,
    );
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
    (auth as unknown as { clerk: typeof clerk }).clerk = clerk;

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
    (auth as unknown as { clerk: typeof clerk }).clerk = clerk;
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
      (auth as unknown as { toastService: { show: () => void } }).toastService,
      "show",
    );

    expect(() => auth.signIn()).not.toThrow();
    expect(() => auth.signUp()).not.toThrow();
    expect(auth.signInModalOpen()).toBeFalse();
    expect(auth.signUpModalOpen()).toBeFalse();
    expect(toastSpy).toHaveBeenCalledTimes(2);
    expect(toastSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title:
          "Auth server offline. Please contact support@sparecores.com for assistance.",
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
    (auth as unknown as { initPromise: Promise<void> }).initPromise =
      Promise.resolve();

    await expectAsync(auth.getToken()).toBeResolvedTo(null);
  });

  it("returns the Clerk session token when available", async () => {
    const auth = createAuth();
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo("session-token");
    (
      auth as unknown as {
        clerk: { session: { getToken: typeof getToken } };
        initPromise: Promise<void>;
      }
    ).clerk = {
      session: { getToken },
    };
    (auth as unknown as { initPromise: Promise<void> }).initPromise =
      Promise.resolve();

    await expectAsync(auth.getToken()).toBeResolvedTo("session-token");
    expect(getToken).toHaveBeenCalledWith(undefined);
  });

  it("requests a named Clerk JWT template when provided", async () => {
    const auth = createAuth();
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo("keeper-token");
    (
      auth as unknown as {
        clerk: { session: { getToken: typeof getToken } };
        initPromise: Promise<void>;
      }
    ).clerk = {
      session: { getToken },
    };
    (auth as unknown as { initPromise: Promise<void> }).initPromise =
      Promise.resolve();

    await expectAsync(auth.getToken("keeper")).toBeResolvedTo("keeper-token");
    expect(getToken).toHaveBeenCalledWith({ template: "keeper" });
  });
});
