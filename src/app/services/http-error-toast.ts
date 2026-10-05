import { ToastOptions } from "./toast.service";

export const TRANSIENT_HTTP_TOAST_ID = "keeper-api-transient-error";

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

export function getTransientHttpToast(error: unknown): ToastOptions | null {
  const status = getErrorStatus(error);

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
