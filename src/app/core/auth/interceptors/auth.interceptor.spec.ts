import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { WWW_API_BASE_URI } from "../auth.constants";
import { AuthStateService } from "../data-access/auth-state.service";
import { authInterceptor } from "./auth.interceptor";

describe("authInterceptor", () => {
  function setup(options: { platformId?: string; token?: string | null }): {
    http: HttpClient;
    httpMock: HttpTestingController;
    getToken: jasmine.Spy;
  } {
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo(
        Object.prototype.hasOwnProperty.call(options, "token")
          ? options.token
          : "test-token",
      );

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: options.platformId ?? "browser" },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthStateService,
          useValue: { getToken },
        },
      ],
    });

    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
      getToken,
    };
  }

  it("sets Authorization only and leaves Content-Type unset on GET", async () => {
    if (!WWW_API_BASE_URI) {
      pending("NG_APP_WWW_API_BASE_URI is not configured");
      return;
    }

    const { http, httpMock } = setup({ token: "test-token" });
    const url = `${WWW_API_BASE_URI}/favorites/servers`;
    const responsePromise = firstValueFrom(http.get(url));

    await Promise.resolve();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.get("Authorization")).toBe("Bearer test-token");
    expect(req.request.headers.has("Content-Type")).toBeFalse();
    req.flush([]);
    await responsePromise;
    httpMock.verify();
  });

  it("bypasses requests outside the browser", async () => {
    if (!WWW_API_BASE_URI) {
      pending("NG_APP_WWW_API_BASE_URI is not configured");
      return;
    }

    const { http, httpMock, getToken } = setup({
      platformId: "server",
      token: "test-token",
    });
    const url = `${WWW_API_BASE_URI}/favorites/servers`;
    const responsePromise = firstValueFrom(http.get(url));

    await Promise.resolve();

    const req = httpMock.expectOne(url);
    expect(getToken).not.toHaveBeenCalled();
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush([]);
    await responsePromise;
    httpMock.verify();
  });

  it("bypasses non-WWW API URLs", async () => {
    const { http, httpMock, getToken } = setup({ token: "test-token" });
    const url = "https://keeper.example/servers";
    const responsePromise = firstValueFrom(http.get(url));

    await Promise.resolve();

    const req = httpMock.expectOne(url);
    expect(getToken).not.toHaveBeenCalled();
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush([]);
    await responsePromise;
    httpMock.verify();
  });

  it("leaves the request unchanged when the token is null", async () => {
    if (!WWW_API_BASE_URI) {
      pending("NG_APP_WWW_API_BASE_URI is not configured");
      return;
    }

    const { http, httpMock, getToken } = setup({ token: null });
    const url = `${WWW_API_BASE_URI}/favorites/servers`;
    const responsePromise = firstValueFrom(http.get(url));

    await Promise.resolve();

    const req = httpMock.expectOne(url);
    expect(getToken).toHaveBeenCalled();
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush([]);
    await responsePromise;
    httpMock.verify();
  });
});
