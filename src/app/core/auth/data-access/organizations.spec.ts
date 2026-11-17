import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AuthState } from "./auth-state";
import { ClerkClient } from "./clerk-client";
import { Organizations } from "./organizations";

describe("Organizations", () => {
  function membership(id: string, name: string, role: string) {
    return {
      role,
      roleName: role === "org:admin" ? "Admin" : "Member",
      organization: { id, name, imageUrl: "" },
    };
  }

  function createService(clerk: Record<string, unknown>): Organizations {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "browser" },
        provideRouter([]),
      ],
    });
    const target = TestBed.inject(ClerkClient) as unknown as {
      clerk: unknown;
      initPromise: Promise<void> | null;
    };
    target.clerk = clerk;
    target.initPromise = Promise.resolve();
    TestBed.inject(AuthState).refreshUser();
    return TestBed.inject(Organizations);
  }

  it("maps memberships and resolves the active admin organization", () => {
    const service = createService({
      user: {
        id: "user_1",
        organizationMemberships: [
          membership("org_b", "Beta", "org:member"),
          membership("org_a", "Alpha", "org:admin"),
        ],
      },
      organization: { id: "org_a" },
    });

    expect(service.memberships().map((item) => item.name)).toEqual([
      "Alpha",
      "Beta",
    ]);
    expect(service.hasOrganizations()).toBeTrue();
    expect(service.active()?.id).toBe("org_a");
    expect(service.isActiveAdmin()).toBeTrue();
  });

  it("switches the active organization through Clerk", async () => {
    const setActive = jasmine.createSpy("setActive").and.resolveTo(undefined);
    const service = createService({
      user: { id: "user_1", organizationMemberships: [] },
      organization: null,
      setActive,
    });

    const result = await service.switchTo("org_a");

    expect(setActive).toHaveBeenCalledOnceWith({ organization: "org_a" });
    expect(result).toEqual({ status: "complete" });
    expect(service.hasOrganizations()).toBeFalse();
  });
});
