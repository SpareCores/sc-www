import { HttpErrorResponse } from "@angular/common/http";
import { ToastOptions } from "./toast.service";
import { TRANSIENT_HTTP_TOAST_ID } from "./toast-ids";

export { TRANSIENT_HTTP_TOAST_ID };
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

export function getHttpErrorDetailMessage(
  error: unknown,
  fallback: string = DEFAULT_HTTP_ERROR_DETAIL,
): string {
  let detail: unknown;

  if (error instanceof HttpErrorResponse) {
    detail = error.error?.detail;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "error" in error &&
    (error as { error: unknown }).error !== null &&
    typeof (error as { error: unknown }).error === "object" &&
    "detail" in ((error as { error: object }).error as object)
  ) {
    detail = (error as { error: { detail: unknown } }).error.detail;
  }

  return typeof detail === "string" && detail ? detail : fallback;
}

export function getTransientHttpToast(error: unknown): ToastOptions | null {
  const status = getErrorStatus(error);

  if (status === 0) {
    return {
      title: "Connection problem",
      body: "We couldn't reach the service. Please try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    };
  }

  if (status === 408) {
    return {
      title: "Request timed out",
      body: "The service took too long to respond. Please try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    };
  }

  if (status === 429) {
    return {
      title: "Too many requests",
      body: "Please wait a moment and try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    };
  }

  if (status !== undefined && status >= 500 && status <= 504) {
    return {
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    };
  }

  return null;
}
