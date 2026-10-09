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

type CancelToken = NonNullable<FullRequestParams["cancelToken"]>;

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
  retryAfterMs?: number | null;
  attempt: number;
  intervals: number[];
  remainingBudgetMs: number;
  nowMs?: number;
}): number {
  const {
    status,
    retryAfterHeader,
    retryAfterMs,
    attempt,
    intervals,
    remainingBudgetMs,
    nowMs = Date.now(),
  } = options;

  let delay = intervals[attempt] ?? intervals[intervals.length - 1] ?? 0;

  if (status === 429 || status === 503) {
    const parsed = retryAfterMs ?? parseRetryAfter(retryAfterHeader, nowMs);
    if (parsed != null) {
      delay = parsed;
    }
  }

  return Math.min(Math.max(0, delay), Math.max(0, remainingBudgetMs));
}

const BACKEND_BASE_URI = import.meta.env.NG_APP_BACKEND_BASE_URI;
const BACKEND_BASE_URI_SSR = import.meta.env.NG_APP_BACKEND_BASE_URI_SSR;

function createAbortError(reason?: unknown): Error {
  const message =
    typeof reason === "string" && reason ? reason : "Request aborted";

  if (typeof DOMException !== "undefined") {
    return new DOMException(message, "AbortError");
  }

  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function throwIfAborted(signal?: AbortSignal | null): void {
  if (signal?.aborted) {
    throw createAbortError(signal.reason);
  }
}

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    name?: unknown;
    type?: unknown;
    error?: { name?: unknown; type?: unknown };
  };

  return (
    candidate.name === "AbortError" ||
    candidate.type === "abort" ||
    candidate.error?.name === "AbortError" ||
    candidate.error?.type === "abort"
  );
}

async function waitForDelay(
  delayMs: number,
  signal?: AbortSignal | null,
): Promise<void> {
  if (delayMs <= 0) {
    throwIfAborted(signal);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError(signal.reason));
      return;
    }

    const onAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      reject(createAbortError(signal?.reason));
    };

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export class KeeperHttpClient extends HttpClientSDK {
  private requestAbortControllers = new Map<CancelToken, AbortController>();

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
    signal,
    cancelToken,
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

    const requestSignal = this.getRequestSignal(cancelToken, signal);

    try {
      const response: any = await this._requestWithRetries(
        method,
        url,
        body,
        type,
        requestSignal,
      );

      return response;
    } finally {
      if (cancelToken !== undefined && cancelToken !== null) {
        this.requestAbortControllers.delete(cancelToken);
      }
    }
  };

  public override abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.requestAbortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.requestAbortControllers.delete(cancelToken);
    }
  };

  private getRetryIntervals(): number[] {
    return isPlatformBrowser(this.platformId)
      ? RETRY_INTERVALS
      : RETRY_INTERVALS_SSR;
  }

  private getRequestSignal(
    cancelToken?: FullRequestParams["cancelToken"],
    signal?: AbortSignal | null,
  ): AbortSignal | undefined {
    if (cancelToken === undefined || cancelToken === null) {
      return signal ?? undefined;
    }

    let controller = this.requestAbortControllers.get(cancelToken);
    if (!controller) {
      controller = new AbortController();
      this.requestAbortControllers.set(cancelToken, controller);
    }

    if (signal) {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener(
          "abort",
          () => controller?.abort(signal.reason),
          { once: true },
        );
      }
    }

    return controller.signal;
  }

  private async buildHeaders(
    type: string | undefined,
    signal?: AbortSignal,
  ): Promise<HttpHeaders> {
    throwIfAborted(signal);

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

    throwIfAborted(signal);

    return new HttpHeaders(headerEntries);
  }

  private async _requestWithRetries(
    method: string | undefined,
    url: URL,
    body: any,
    type: string | undefined,
    signal?: AbortSignal,
    retry: number = 0,
    accumulatedWaitMs: number = 0,
  ): Promise<any> {
    const observe = "response" as const;
    const intervals = this.getRetryIntervals();
    const maxWaitMs = maxTotalRetryWaitMs(intervals);

    try {
      const headers = await this.buildHeaders(type, signal);
      const requestOptions: any = {
        body,
        headers,
        observe,
      };
      if (signal) {
        requestOptions.signal = signal;
      }
      return await firstValueFrom(
        this.angularHttp.request(
          method || "GET",
          url.toString(),
          requestOptions,
        ),
      );
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
      const retryAfterMs = parseRetryAfter(retryAfterHeader);
      if (status === 429 || status === 503) {
        if (retryAfterMs != null && retryAfterMs > remainingBudgetMs) {
          throw err;
        }
      }

      const delay = getRetryDelay({
        status,
        retryAfterHeader,
        retryAfterMs,
        attempt: retry,
        intervals,
        remainingBudgetMs,
      });

      await waitForDelay(delay, signal);
      return this._requestWithRetries(
        method,
        url,
        body,
        type,
        signal,
        retry + 1,
        accumulatedWaitMs + delay,
      );
    }
  }
}
