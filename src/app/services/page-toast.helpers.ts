import { isPlatformBrowser } from "@angular/common";
import type { Toast } from "./toast";
import { INVALID_URL_TOAST_TITLE } from "./url-toast-content";

type InvalidUrlToastAction = {
  label: string;
  onClick: () => void;
};

export function showInvalidUrlParamToast(
  toastService: Pick<Toast, "show">,
  platformId: object,
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
