import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AUTH_MESSAGES } from "../auth.constants";
import { AuthStateService } from "./auth-state.service";
import { ClerkService } from "./clerk.service";
import { ProfileService } from "./profile.service";

describe("ProfileService", () => {
  function createService(clerk: unknown): {
    service: ProfileService;
    auth: AuthStateService;
  } {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "browser" },
        provideRouter([]),
      ],
    });
    const target = TestBed.inject(ClerkService) as unknown as {
      clerk: unknown;
      initPromise: Promise<void> | null;
    };
    target.clerk = clerk;
    target.initPromise = Promise.resolve();
    return {
      service: TestBed.inject(ProfileService),
      auth: TestBed.inject(AuthStateService),
    };
  }

  function createUser(overrides: Record<string, unknown> = {}) {
    return {
      id: "user_1",
      firstName: "Jane",
      lastName: "Doe",
      username: null,
      imageUrl: "",
      hasImage: false,
      primaryEmailAddressId: "email_1",
      emailAddresses: [
        {
          id: "email_1",
          emailAddress: "jane@example.com",
          verification: { status: "verified" },
        },
      ],
      externalAccounts: [],
      passwordEnabled: true,
      deleteSelfEnabled: true,
      update: jasmine.createSpy("update").and.resolveTo(undefined),
      reload: jasmine.createSpy("reload").and.resolveTo(undefined),
      delete: jasmine.createSpy("delete").and.resolveTo(undefined),
      setProfileImage: jasmine.createSpy("setProfileImage"),
      ...overrides,
    };
  }

  it("updates the name with trimmed values and reloads the user", async () => {
    const user = createUser();
    const { service } = createService({ user });

    const result = await service.updateName({
      firstName: " Ada ",
      lastName: " Lovelace ",
    });

    expect(result).toEqual({ status: "complete" });
    expect(user.update).toHaveBeenCalledOnceWith({
      firstName: "Ada",
      lastName: "Lovelace",
    });
    expect(user.reload).toHaveBeenCalled();
  });

  it("rejects unsupported avatar files", async () => {
    const user = createUser();
    const { service } = createService({ user });

    const result = await service.setAvatar(
      new File(["x"], "avatar.txt", { type: "text/plain" }),
    );

    expect(result).toEqual({
      status: "error",
      message: AUTH_MESSAGES.avatarInvalidType,
    });
    expect(user.setProfileImage).not.toHaveBeenCalled();
  });

  it("asks for reverification when Clerk requires it", async () => {
    const user = createUser({
      update: jasmine.createSpy("update").and.rejectWith({
        errors: [{ code: "session_reverification_required" }],
      }),
    });
    const { service } = createService({ user });

    const result = await service.setPrimaryEmail("email_2");

    expect(result).toEqual({ status: "reverify" });
  });

  it("hides the password section for GitHub-only users", () => {
    const user = createUser({
      passwordEnabled: false,
      externalAccounts: [
        {
          id: "ext_1",
          provider: "github",
          username: "jane",
          verification: { status: "verified" },
        },
      ],
    });
    const { service, auth } = createService({ user });
    (auth as unknown as { setUser(value: unknown): void }).setUser(user);

    const profile = service.profile();

    expect(profile?.showPasswordSection).toBeFalse();
    expect(profile?.github?.label).toBe("jane");
    expect(profile?.emails[0].isPrimary).toBeTrue();
  });

  it("marks the account deletion and clears the session", async () => {
    const user = createUser();
    const setActive = jasmine.createSpy("setActive").and.resolveTo(undefined);
    const { service, auth } = createService({ user, setActive });
    const markSpy = spyOn(auth, "markAccountDeleted").and.callThrough();

    const result = await service.deleteAccount();

    expect(result).toEqual({ status: "complete" });
    expect(markSpy).toHaveBeenCalledOnceWith(true);
    expect(user.delete).toHaveBeenCalled();
    expect(setActive).toHaveBeenCalledOnceWith({ session: null });
  });

  it("clears the deletion mark when deleting fails", async () => {
    const user = createUser({
      delete: jasmine.createSpy("delete").and.rejectWith(new Error("nope")),
    });
    const { service, auth } = createService({ user });
    const markSpy = spyOn(auth, "markAccountDeleted").and.callThrough();

    const result = await service.deleteAccount();

    expect(result.status).toBe("error");
    expect(markSpy.calls.allArgs()).toEqual([[true], [false]]);
  });
});
