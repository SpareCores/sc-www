import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AUTH_MESSAGES, WWW_API_BASE_URI } from "../auth.constants";
import { ApiTokens } from "./api-tokens";
import { AuthState } from "./auth-state";
import { ClerkClient } from "./clerk-client";

describe("ApiTokens", () => {
  function apiKey(id: string, revoked = false) {
    return {
      id,
      name: id,
      revoked,
      expired: false,
      expiration: null,
      lastUsedAt: null,
      createdAt: new Date("2026-11-01T00:00:00Z"),
    };
  }

  function createService(clerk: Record<string, unknown>): ApiTokens {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "browser" },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const target = TestBed.inject(ClerkClient) as unknown as {
      clerk: unknown;
      initPromise: Promise<void> | null;
    };
    target.clerk = clerk;
    target.initPromise = Promise.resolve();
    TestBed.inject(AuthState).refreshUser();
    return TestBed.inject(ApiTokens);
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it("lists active user and organization tokens by subject", async () => {
    const getAll = jasmine
      .createSpy("getAll")
      .and.callFake(({ subject }: { subject: string }) =>
        Promise.resolve({
          data:
            subject === "user_1"
              ? [apiKey("ak_user"), apiKey("ak_revoked", true)]
              : [apiKey("ak_org")],
          total_count: 1,
        }),
      );
    const service = createService({
      user: { id: "user_1" },
      apiKeys: { getAll },
    });

    const result = await service.list("org_1");

    expect(getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ subject: "user_1" }),
    );
    expect(getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ subject: "org_1" }),
    );
    expect(result).toEqual(
      jasmine.objectContaining({
        status: "complete",
        user: [jasmine.objectContaining({ id: "ak_user", owner: "user" })],
        organizationId: "org_1",
        organization: [
          jasmine.objectContaining({ id: "ak_org", owner: "organization" }),
        ],
        organizationError: "",
      }),
    );
  });

  it("keeps user tokens when the organization listing is refused", async () => {
    const getAll = jasmine
      .createSpy("getAll")
      .and.callFake(({ subject }: { subject: string }) =>
        subject === "user_1"
          ? Promise.resolve({ data: [apiKey("ak_user")], total_count: 1 })
          : Promise.reject(new Error("forbidden")),
      );
    const service = createService({
      user: { id: "user_1" },
      apiKeys: { getAll },
    });

    const result = await service.list("org_1");

    expect(result).toEqual(
      jasmine.objectContaining({
        status: "complete",
        organization: null,
        organizationError: AUTH_MESSAGES.organizationTokensUnavailable,
      }),
    );
  });

  it("fetches every page of tokens", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      apiKey(`ak_${index}`),
    );
    const getAll = jasmine
      .createSpy("getAll")
      .and.callFake(({ initialPage }: { initialPage: number }) =>
        Promise.resolve({
          data: initialPage === 1 ? firstPage : [apiKey("ak_last")],
          total_count: 101,
        }),
      );
    const service = createService({
      user: { id: "user_1" },
      apiKeys: { getAll },
    });

    const result = await service.list(null);

    expect(getAll).toHaveBeenCalledTimes(2);
    expect(result).toEqual(
      jasmine.objectContaining({
        status: "complete",
        organization: null,
      }),
    );
    expect(result.status === "complete" && result.user.length).toBe(101);
  });

  it("creates an organization token through the www API", async () => {
    const service = createService({ user: { id: "user_1" } });
    const http = TestBed.inject(HttpTestingController);

    const pending = service.create({
      name: " ci ",
      secondsUntilExpiration: 3600,
      owner: "organization",
    });
    const request = http.expectOne(`${WWW_API_BASE_URI}/tokens`);
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({
      name: "ci",
      owner: "organization",
      seconds_until_expiration: 3600,
    });
    request.flush({
      id: "ak_1",
      name: "ci",
      secret: "ak_secret",
      owner: "organization",
      subject: "org_1",
      expiration: null,
    });

    expect(await pending).toEqual({
      status: "complete",
      token: { name: "ci", secret: "ak_secret", owner: "organization" },
    });
  });

  it("surfaces the API error detail when creation fails", async () => {
    const service = createService({ user: { id: "user_1" } });
    const http = TestBed.inject(HttpTestingController);

    const pending = service.create({
      name: "ci",
      secondsUntilExpiration: null,
      owner: "user",
    });
    http
      .expectOne(`${WWW_API_BASE_URI}/tokens`)
      .flush(
        { detail: { code: "conflict", message: "Name already used." } },
        { status: 409, statusText: "Conflict" },
      );

    expect(await pending).toEqual({
      status: "error",
      message: "Name already used.",
    });
  });

  it("revokes a token through Clerk", async () => {
    const revoke = jasmine.createSpy("revoke").and.resolveTo({});
    const service = createService({
      user: { id: "user_1" },
      apiKeys: { revoke },
    });

    expect(await service.revoke("ak_1")).toEqual({ status: "complete" });
    expect(revoke).toHaveBeenCalledOnceWith({ apiKeyID: "ak_1" });
  });
});
