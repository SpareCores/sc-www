import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, PLATFORM_ID } from "@angular/core";
import {
  FullRequestParams,
  HttpClient as HttpClientSDK,
  HttpResponse,
} from "../../../sdk/http-client";
import { Observable, Subscription, firstValueFrom } from "rxjs";
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

function createAbortError(): Error {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  return error;
}

export function isAbortError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name: unknown }).name === "AbortError"
  );
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

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function delayMs(ms: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(createAbortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function firstValueFromWithSignal<T>(
  source: Observable<T>,
  signal?: AbortSignal,
): Promise<T> {
  throwIfAborted(signal);
  if (!signal) {
    return firstValueFrom(source);
  }
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const subscription = new Subscription();

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      signal.removeEventListener("abort", onAbort);
      subscription.unsubscribe();
      callback();
    };

    const onAbort = () => {
      settle(() => reject(createAbortError()));
    };

    subscription.add(
      source.subscribe({
        next: (value) => {
          settle(() => resolve(value));
        },
        error: (err) => {
          settle(() => reject(err));
        },
      }),
    );

    if (signal.aborted) {
      onAbort();
      return;
    }
    if (!settled) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
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
    signal: requestSignal,
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const signal = requestSignal ?? undefined;
    throwIfAborted(signal);

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
      throwIfAborted(signal);
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
      signal,
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
    signal?: AbortSignal,
    retry: number = 0,
    accumulatedWaitMs: number = 0,
  ): Promise<any> {
    throwIfAborted(signal);

    let response: any;
    const observe = "response";
    const intervals = this.getRetryIntervals();
    const maxWaitMs = maxTotalRetryWaitMs(intervals);

    try {
      if (method === "GET") {
        response = await firstValueFromWithSignal(
          this.angularHttp.get(url.toString(), { headers, observe }),
          signal,
        );
      } else if (method === "POST") {
        response = await firstValueFromWithSignal(
          this.angularHttp.post(url.toString(), body, { headers, observe }),
          signal,
        );
      } else if (method === "PATCH") {
        response = await firstValueFromWithSignal(
          this.angularHttp.patch(url.toString(), body, { headers, observe }),
          signal,
        );
      } else if (method === "DELETE") {
        response = await firstValueFromWithSignal(
          this.angularHttp.delete(url.toString(), { headers, observe }),
          signal,
        );
      }

      return response;
    } catch (err: any) {
      if (isAbortError(err)) {
        throw err;
      }

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

      const retryAfterHeader = err?.headers?.get?.("Retry-After");
      if (status === 429 || status === 503) {
        const parsed = parseRetryAfter(retryAfterHeader);
        if (parsed != null && parsed > remainingBudgetMs) {
          throw err;
        }
      }

      const delay = getRetryDelay({
        status,
        retryAfterHeader,
        attempt: retry,
        intervals,
        remainingBudgetMs,
      });

      await delayMs(delay, signal);
      return this._requestWithRetries(
        method,
        url,
        body,
        headers,
        signal,
        retry + 1,
        accumulatedWaitMs + delay,
      );
    }
  }
}
