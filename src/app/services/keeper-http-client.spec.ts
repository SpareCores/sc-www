import { HttpClient, provideHttpClient, withFetch } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PLATFORM_ID } from "@angular/core";
import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from "@angular/core/testing";
import { AuthStateService } from "../core/auth";
import {
  KeeperHttpClient,
  RETRY_INTERVALS,
  RETRY_INTERVALS_SSR,
  getRetryDelay,
  isAbortError,
  isAutomaticallyRetryableMethod,
  maxTotalRetryWaitMs,
  parseRetryAfter,
} from "./keeper-http-client";

describe("KeeperHttpClient", () => {
  let client: KeeperHttpClient;
  let httpMock: HttpTestingController;
  const path = "/servers";
  const baseUri = import.meta.env.NG_APP_BACKEND_BASE_URI || "";

  function requestUrl(): string {
    return `${baseUri}${path}`;
  }

  function setup(platformId: object = "browser" as unknown as object) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platformId },
        {
          provide: AuthStateService,
          useValue: { getToken: () => Promise.resolve(null) },
        },
      ],
    });

    const angularHttp = TestBed.inject(HttpClient);
    const auth = TestBed.inject(AuthStateService);
    client = new KeeperHttpClient(angularHttp, platformId, auth);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock?.verify();
  });

  describe("parseRetryAfter", () => {
    it("parses delta-seconds", () => {
      expect(parseRetryAfter("2")).toBe(2000);
    });

    it("parses HTTP-date relative to now", () => {
      const now = Date.parse("Wed, 21 Oct 2026 07:28:00 GMT");
      expect(parseRetryAfter("Wed, 21 Oct 2026 07:28:05 GMT", now)).toBe(5000);
    });

    it("returns null for invalid values", () => {
      expect(parseRetryAfter("invalid")).toBeNull();
      expect(parseRetryAfter(null)).toBeNull();
    });

    it("clamps negative delta to 0", () => {
      const now = Date.parse("Wed, 21 Oct 2026 07:28:05 GMT");
      expect(parseRetryAfter("Wed, 21 Oct 2026 07:28:00 GMT", now)).toBe(0);
    });
  });

  describe("browser retries", () => {
    beforeEach(() => setup("browser" as unknown as object));

    it("retries 408 then succeeds after first interval", fakeAsync(() => {
      let resolved: unknown;
      let rejected: unknown;

      client
        .request({ method: "GET", path })
        .then((res) => (resolved = res))
        .catch((err) => (rejected = err));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 408,
        statusText: "Request Timeout",
      });

      tick(RETRY_INTERVALS[0] - 1);
      flushMicrotasks();
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(rejected).toBeUndefined();
      expect(resolved).toBeTruthy();
    }));

    it("retries status 0 using the normal first interval", fakeAsync(() => {
      let resolved: unknown;

      client.request({ method: "GET", path }).then((res) => (resolved = res));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).error(new ProgressEvent("error"));

      tick(RETRY_INTERVALS[0] - 1);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(resolved).toBeTruthy();
    }));

    it("retries 429 without Retry-After using the first interval", fakeAsync(() => {
      let resolved: unknown;

      client.request({ method: "GET", path }).then((res) => (resolved = res));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 429,
        statusText: "Too Many Requests",
      });

      tick(RETRY_INTERVALS[0] - 1);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(resolved).toBeTruthy();
    }));

    it("honors Retry-After: 1 at the 999/1000ms boundary", fakeAsync(() => {
      let resolved: unknown;

      client.request({ method: "GET", path }).then((res) => (resolved = res));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "1" },
      });

      tick(999);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(resolved).toBeTruthy();
    }));

    it("honors Retry-After on 503", fakeAsync(() => {
      let resolved: unknown;

      client.request({ method: "GET", path }).then((res) => (resolved = res));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Retry-After": "1" },
      });

      tick(999);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(resolved).toBeTruthy();
    }));

    (["POST", "PATCH", "DELETE"] as const).forEach((method) => {
      it(`does not retry ${method} on 408`, fakeAsync(() => {
        let rejected: unknown;

        client
          .request({ method, path, body: {} })
          .catch((err) => (rejected = err));

        flushMicrotasks();
        httpMock.expectOne(requestUrl()).flush(null, {
          status: 408,
          statusText: "Request Timeout",
        });
        flushMicrotasks();

        expect((rejected as { status: number }).status).toBe(408);
        tick(RETRY_INTERVALS[0]);
        expect(httpMock.match(requestUrl()).length).toBe(0);
      }));
    });

    it("falls back to the interval for invalid Retry-After", fakeAsync(() => {
      let resolved: unknown;

      client.request({ method: "GET", path }).then((res) => (resolved = res));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "invalid" },
      });

      tick(RETRY_INTERVALS[0] - 1);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(1);
      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush([{ ok: true }]);
      flushMicrotasks();

      expect(resolved).toBeTruthy();
    }));

    it("fails fast when Retry-After exceeds the remaining wait budget", fakeAsync(() => {
      let rejected: unknown;

      client.request({ method: "GET", path }).catch((err) => (rejected = err));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "47" },
      });
      flushMicrotasks();

      expect(rejected).toBeTruthy();
      expect((rejected as { status: number }).status).toBe(429);
      expect(httpMock.match(requestUrl()).length).toBe(0);

      tick(maxTotalRetryWaitMs(RETRY_INTERVALS));
      expect(httpMock.match(requestUrl()).length).toBe(0);
    }));

    it("stops retrying when the abort signal fires during delay", fakeAsync(() => {
      let rejected: unknown;
      const abortController = new AbortController();

      client
        .request({ method: "GET", path, signal: abortController.signal })
        .catch((err) => (rejected = err));

      flushMicrotasks();
      httpMock.expectOne(requestUrl()).flush(null, {
        status: 503,
        statusText: "Service Unavailable",
      });

      tick(RETRY_INTERVALS[0] / 2);
      abortController.abort();
      flushMicrotasks();

      expect(isAbortError(rejected)).toBeTrue();
      tick(RETRY_INTERVALS[0]);
      expect(httpMock.match(requestUrl()).length).toBe(0);
    }));

    it("rejects immediately when the abort signal is already aborted", fakeAsync(() => {
      let rejected: unknown;
      const abortController = new AbortController();
      abortController.abort();

      client
        .request({ method: "GET", path, signal: abortController.signal })
        .catch((err) => (rejected = err));

      flushMicrotasks();

      expect(isAbortError(rejected)).toBeTrue();
      expect(httpMock.match(requestUrl()).length).toBe(0);
    }));

    it("does not retry 400", fakeAsync(() => {
      let rejected: unknown;

      client.request({ method: "GET", path }).catch((err) => (rejected = err));

      flushMicrotasks();
      const req = httpMock.expectOne(requestUrl());
      req.flush({ detail: "bad" }, { status: 400, statusText: "Bad Request" });
      flushMicrotasks();

      expect(rejected).toBeTruthy();
      expect((rejected as { status: number }).status).toBe(400);
      tick(RETRY_INTERVALS[0]);
      expect(httpMock.match(requestUrl()).length).toBe(0);
    }));

    it("does not retry 404", fakeAsync(() => {
      let rejected: unknown;

      client.request({ method: "GET", path }).catch((err) => (rejected = err));

      flushMicrotasks();
      httpMock
        .expectOne(requestUrl())
        .flush(null, { status: 404, statusText: "Not Found" });
      flushMicrotasks();

      expect((rejected as { status: number }).status).toBe(404);
      tick(RETRY_INTERVALS[0]);
      expect(httpMock.match(requestUrl()).length).toBe(0);
    }));

    ([408, 429, 500, 501, 502, 503, 504] as const).forEach((status) => {
      it(`exhausts after 7 attempts for ${status}`, fakeAsync(() => {
        let rejected: unknown;

        client
          .request({ method: "GET", path })
          .catch((err) => (rejected = err));

        flushMicrotasks();
        for (let attempt = 0; attempt < RETRY_INTERVALS.length + 1; attempt++) {
          httpMock.expectOne(requestUrl()).flush(null, {
            status,
            statusText: "Error",
          });
          if (attempt < RETRY_INTERVALS.length) {
            tick(RETRY_INTERVALS[attempt]);
            flushMicrotasks();
          }
        }

        flushMicrotasks();
        expect((rejected as { status: number }).status).toBe(status);
        expect(httpMock.match(requestUrl()).length).toBe(0);
      }));
    });
  });

  describe("SSR retries", () => {
    beforeEach(() => setup("server" as unknown as object));

    it("exhausts after 3 attempts for 500", fakeAsync(() => {
      let rejected: unknown;

      client.request({ method: "GET", path }).catch((err) => (rejected = err));

      flushMicrotasks();
      for (
        let attempt = 0;
        attempt < RETRY_INTERVALS_SSR.length + 1;
        attempt++
      ) {
        httpMock.expectOne(requestUrl()).flush(null, {
          status: 500,
          statusText: "Error",
        });
        if (attempt < RETRY_INTERVALS_SSR.length) {
          tick(RETRY_INTERVALS_SSR[attempt]);
          flushMicrotasks();
        }
      }

      flushMicrotasks();
      expect((rejected as { status: number }).status).toBe(500);
    }));
  });

  describe("getRetryDelay budget cap", () => {
    it("never exceeds remaining budget", () => {
      expect(
        getRetryDelay({
          status: 429,
          retryAfterHeader: "3600",
          attempt: 0,
          intervals: RETRY_INTERVALS,
          remainingBudgetMs: 18700,
        }),
      ).toBe(18700);

      expect(
        getRetryDelay({
          status: 429,
          retryAfterHeader: "1",
          attempt: 0,
          intervals: RETRY_INTERVALS,
          remainingBudgetMs: 100,
        }),
      ).toBe(100);
    });

    it("honors Retry-After on 503 within the remaining budget", () => {
      expect(
        getRetryDelay({
          status: 503,
          retryAfterHeader: "2",
          attempt: 0,
          intervals: RETRY_INTERVALS,
          remainingBudgetMs: 18700,
        }),
      ).toBe(2000);
    });
  });

  describe("isAutomaticallyRetryableMethod", () => {
    it("allows only GET", () => {
      expect(isAutomaticallyRetryableMethod("GET")).toBeTrue();
      expect(isAutomaticallyRetryableMethod("POST")).toBeFalse();
      expect(isAutomaticallyRetryableMethod("PATCH")).toBeFalse();
      expect(isAutomaticallyRetryableMethod("DELETE")).toBeFalse();
    });
  });
});
