import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { WWW_API_BASE_URI } from "../auth.constants";
import { AuthStateService } from "../data-access/auth-state.service";
import { authInterceptor } from "./auth.interceptor";

describe("authInterceptor", () => {
  it("sets Authorization only and leaves Content-Type unset on GET", async () => {
    if (!WWW_API_BASE_URI) {
      pending("NG_APP_WWW_API_BASE_URI is not configured");
      return;
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthStateService,
          useValue: {
            getToken: () => Promise.resolve("test-token"),
          },
        },
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
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
});
