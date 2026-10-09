import { HttpErrorResponse } from "@angular/common/http";
import { ToastOptions } from "./toast.service";

export const DEFAULT_HTTP_ERROR_DETAIL = "Please try again later.";

function getErrorStatus(error: unknown): number | undefined {
  if (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return undefined;
}

function getErrorBody(error: unknown): unknown {
  if (error instanceof HttpErrorResponse) {
    return error.error;
  }
  if (error !== null && typeof error === "object" && "error" in error) {
    return (error as { error: unknown }).error;
  }
  return undefined;
}

export function getHttpErrorDetailMessage(
  error: unknown,
  fallback: string = DEFAULT_HTTP_ERROR_DETAIL,
): string {
  const body = getErrorBody(error);
  const status = getErrorStatus(error);

  if ((status === 400 || status === 422) && body != null && body !== "") {
    return typeof body === "string" ? body : JSON.stringify(body, null, 2);
  }

  let detail: unknown;
  if (
    body !== null &&
    typeof body === "object" &&
    "detail" in (body as object)
  ) {
    detail = (body as { detail: unknown }).detail;
  }

  return typeof detail === "string" && detail ? detail : fallback;
}

export function getTransientHttpToast(
  error: unknown,
  id: string,
): ToastOptions | null {
  const status = getErrorStatus(error);

  if (status === 0) {
    return {
      title: "Connection problem",
      body: "We couldn't reach the service. Please try again.",
      type: "error",
      id,
    };
  }

  if (status === 408) {
    return {
      title: "Request timed out",
      body: "The service took too long to respond. Please try again.",
      type: "error",
      id,
    };
  }

  if (status === 429) {
    return {
      title: "Too many requests",
      body: "Please wait a moment and try again.",
      type: "error",
      id,
    };
  }

  if (status !== undefined && status >= 500 && status <= 504) {
    return {
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
      id,
    };
  }

  return null;
}
