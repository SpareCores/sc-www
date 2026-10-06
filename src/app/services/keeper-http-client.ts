import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, PLATFORM_ID } from "@angular/core";
import {
  FullRequestParams,
  HttpClient as HttpClientSDK,
  HttpResponse,
} from "../../../sdk/http-client";
import { firstValueFrom } from "rxjs";
import { AuthStateService } from "../core/auth";

export const RETRY_INTERVALS = [200, 500, 1000, 2000, 5000, 10000];
export const RETRY_INTERVALS_SSR = [100, 200];

export const RETRYABLE_STATUS_CODES = new Set([
  408, 429, 500, 501, 502, 503, 504,
]);

export function maxTotalRetryWaitMs(intervals: number[]): number {
  return intervals.reduce((total, interval) => total + interval, 0);
}

export function isRetryableStatus(status: number): boolean {
  if (status === 0) {
    return true;
  }
  return RETRYABLE_STATUS_CODES.has(status);
}

export function isAutomaticallyRetryableMethod(
  method: string | undefined,
): boolean {
  return method === "GET";
}

export function parseRetryAfter(
  header: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (header == null || header === "") {
    return null;
  }

  const trimmed = header.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds)) {
      return null;
    }
    return Math.max(0, seconds * 1000);
  }

  const dateMs = Date.parse(trimmed);
  if (Number.isNaN(dateMs)) {
    return null;
  }
  return Math.max(0, dateMs - nowMs);
}

export function getRetryDelay(options: {
  status: number;
  retryAfterHeader?: string | null;
  attempt: number;
  intervals: number[];
  remainingBudgetMs: number;
  nowMs?: number;
}): number {
  const {
    status,
    retryAfterHeader,
    attempt,
    intervals,
    remainingBudgetMs,
    nowMs = Date.now(),
  } = options;

  let delay = intervals[attempt] ?? intervals[intervals.length - 1] ?? 0;

  if (status === 429 || status === 503) {
    const parsed = parseRetryAfter(retryAfterHeader, nowMs);
    if (parsed != null) {
      delay = parsed;
    }
  }

  return Math.min(Math.max(0, delay), Math.max(0, remainingBudgetMs));
}

const BACKEND_BASE_URI = import.meta.env.NG_APP_BACKEND_BASE_URI;
const BACKEND_BASE_URI_SSR = import.meta.env.NG_APP_BACKEND_BASE_URI_SSR;

export class KeeperHttpClient extends HttpClientSDK {
  constructor(
    private angularHttp: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
    private auth: AuthStateService,
  ) {
    super();
  }

  public override request = async <T = any, E = any>({
    method,
    body,
    path,
    type,
    query,
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const url = new URL(
      (isPlatformBrowser(this.platformId)
        ? BACKEND_BASE_URI
        : BACKEND_BASE_URI_SSR) + path,
    );

    if (query) {
      const queryStr = this.addQueryParams(query);
      url.search = queryStr;
    }

    const headerEntries: Record<string, string> = {
      "Content-Type": type || "application/json",
      "X-Application-ID": "sc-www",
    };

    if (isPlatformBrowser(this.platformId)) {
      const token = await this.auth.getToken();
      if (token) {
        headerEntries["Authorization"] = `Bearer ${token}`;
      }
    }

    const headers = new HttpHeaders(headerEntries);

    const response: any = await this._requestWithRetries(
      method,
      url,
      body,
      headers,
    );

    return response;
  };

  private getRetryIntervals(): number[] {
    return isPlatformBrowser(this.platformId)
      ? RETRY_INTERVALS
      : RETRY_INTERVALS_SSR;
  }

  private async _requestWithRetries(
    method: string | undefined,
    url: URL,
    body: any,
    headers: HttpHeaders,
    retry: number = 0,
    accumulatedWaitMs: number = 0,
  ): Promise<any> {
    let response: any;
    const observe = "response";
    const intervals = this.getRetryIntervals();
    const maxWaitMs = maxTotalRetryWaitMs(intervals);

    try {
      if (method === "GET") {
        response = await firstValueFrom(
          this.angularHttp.get(url.toString(), { headers, observe }),
        );
      } else if (method === "POST") {
        response = await firstValueFrom(
          this.angularHttp.post(url.toString(), body, { headers, observe }),
        );
      } else if (method === "PATCH") {
        response = await firstValueFrom(
          this.angularHttp.patch(url.toString(), body, { headers, observe }),
        );
      } else if (method === "DELETE") {
        response = await firstValueFrom(
          this.angularHttp.delete(url.toString(), { headers, observe }),
        );
      }

      return response;
    } catch (err: any) {
      const status = err?.status ?? 0;

      if (
        !isAutomaticallyRetryableMethod(method) ||
        !isRetryableStatus(status) ||
        retry >= intervals.length
      ) {
        throw err;
      }

      const remainingBudgetMs = maxWaitMs - accumulatedWaitMs;
      if (remainingBudgetMs <= 0) {
        throw err;
      }

      const delay = getRetryDelay({
        status,
        retryAfterHeader: err?.headers?.get?.("Retry-After"),
        attempt: retry,
        intervals,
        remainingBudgetMs,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this._requestWithRetries(
        method,
        url,
        body,
        headers,
        retry + 1,
        accumulatedWaitMs + delay,
      );
    }
  }
}
