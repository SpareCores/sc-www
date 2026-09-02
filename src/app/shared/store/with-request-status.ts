import { computed } from "@angular/core";
import { signalStoreFeature, withComputed, withState } from "@ngrx/signals";

export type RequestStatus =
  | "idle"
  | "loading"
  | "loaded"
  | { error: string };

export type RequestStatusState = {
  requestStatus: RequestStatus;
};

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: "idle" }),
    withComputed(({ requestStatus }) => ({
      isLoading: computed(() => requestStatus() === "loading"),
      isLoaded: computed(() => requestStatus() === "loaded"),
      error: computed(() => {
        const status = requestStatus();
        return typeof status === "object" ? status.error : null;
      }),
    })),
  );
}

export function setIdle(): { requestStatus: RequestStatus } {
  return { requestStatus: "idle" };
}

export function setLoading(): { requestStatus: RequestStatus } {
  return { requestStatus: "loading" };
}

export function setLoaded(): { requestStatus: RequestStatus } {
  return { requestStatus: "loaded" };
}

export function setError(error: string): { requestStatus: RequestStatus } {
  return { requestStatus: { error } };
}
