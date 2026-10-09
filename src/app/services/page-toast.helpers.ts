import { isPlatformBrowser } from "@angular/common";
import type { ToastService } from "./toast.service";
import { INVALID_URL_TOAST_TITLE } from "./url-toast-content";

type InvalidUrlToastAction = {
  label: string;
  onClick: () => void;
};

export function dismissPageHttpToasts(
  toastService: Pick<ToastService, "removeToast">,
  ownedToastIds: string | string[],
): void {
  const toastIds = Array.isArray(ownedToastIds)
    ? ownedToastIds
    : [ownedToastIds];
  toastIds.forEach((toastId) => toastService.removeToast(toastId));
}

export function showInvalidUrlParamToast(
  toastService: Pick<ToastService, "show">,
  platformId: Object,
  options: {
    id: string;
    body: string;
    action?: InvalidUrlToastAction;
  },
): void {
  if (!isPlatformBrowser(platformId)) {
    return;
  }

  toastService.show({
    title: INVALID_URL_TOAST_TITLE,
    body: options.body,
    type: "error",
    id: options.id,
    action: options.action,
  });
}
