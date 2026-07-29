import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Auth } from "./auth";

describe("Auth", () => {
  function createAuth(platformId: string = "browser"): Auth {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
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

  it("opens Clerk UI only when Clerk is available", () => {
    const auth = createAuth();
    const clerk = {
      openSignIn: jasmine.createSpy("openSignIn"),
      openSignUp: jasmine.createSpy("openSignUp"),
      openUserProfile: jasmine.createSpy("openUserProfile"),
      signOut: jasmine.createSpy("signOut").and.resolveTo(undefined),
      user: null,
    };
    (auth as unknown as { clerk: typeof clerk }).clerk = clerk;

    auth.signIn();
    auth.signUp();
    auth.openUserProfile();

    expect(clerk.openSignIn).toHaveBeenCalledWith({ withSignUp: true });
    expect(clerk.openSignUp).toHaveBeenCalled();
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
      openSignIn: jasmine.Spy;
      openSignUp: jasmine.Spy;
      openUserProfile: jasmine.Spy;
      signOut: jasmine.Spy;
      user: typeof signedInUser | null;
    } = {
      openSignIn: jasmine.createSpy("openSignIn"),
      openSignUp: jasmine.createSpy("openSignUp"),
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

  it("does not throw when Clerk is not initialized", async () => {
    const auth = createAuth();

    expect(() => auth.signIn()).not.toThrow();
    expect(() => auth.signUp()).not.toThrow();
    expect(() => auth.openUserProfile()).not.toThrow();
    await expectAsync(auth.signOut()).toBeResolved();
  });
});
