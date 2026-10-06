import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { OnDestroy } from "@angular/core";
import {
  getHttpErrorDetailMessage,
  getTransientHttpToast,
  TRANSIENT_HTTP_TOAST_ID,
} from "./http-error-toast";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  /** The title text to display on the first line of the toast notification */
  title: string;
  /** Optional body text to display below the title */
  body?: string;
  /** Optional clickable action rendered below the body */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** The type/style of toast - 'success', 'error', 'warning', or 'info' (default: 'info') */
  type?: ToastType;
  /** Duration in ms to show the toast. If null, toast requires manual dismissal (default: null) */
  duration?: number | null;
  /** Optional unique ID for the toast, so that it can be referenced/removed later. If not provided, one will be auto-generated */
  id?: string;
}
@Injectable({
  providedIn: "root",
})
export class ToastService implements OnDestroy {
  private toastContainer: HTMLDivElement | null = null;
  private toasts = new Map<string, { element: HTMLElement; timeoutId?: any }>();
  private platformId = inject(PLATFORM_ID);
  private toastTimers: { [id: string]: any } = {};

  constructor() {
    this.setupContainer();
  }

  private setupContainer() {
    if (isPlatformBrowser(this.platformId) && !this.toastContainer) {
      this.toastContainer = document.createElement("div");
      this.toastContainer.className =
        "fixed top-[80px] right-4 z-50 flex flex-col items-end gap-1";
      document.body.appendChild(this.toastContainer);
    }
  }

  showTransientHttpError(error: unknown): boolean {
    const toast = getTransientHttpToast(error);
    if (!toast) {
      return false;
    }
    this.show(toast);
    return true;
  }

  clearTransientHttpError(): void {
    this.removeToast(TRANSIENT_HTTP_TOAST_ID);
  }

  showHttpError(
    error: unknown,
    options: { id: string; title?: string; body?: string },
  ): void {
    if (this.showTransientHttpError(error)) {
      return;
    }
    this.show({
      title: options.title ?? "Query error!",
      body: options.body ?? getHttpErrorDetailMessage(error),
      type: "error",
      id: options.id,
    });
  }

  show(options: ToastOptions) {
    if (!isPlatformBrowser(this.platformId) || !this.toastContainer) return;

    const { title, body, action, type = "info", duration = null, id } = options;

    const toastId =
      id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const toast = document.createElement("div");
    toast.className =
      "rounded-lg p-2 transform transition-all duration-300 ease-in-out translate-x-0";

    toast.setAttribute("data-cy", "toast");
    toast.setAttribute("data-toast-type", type);

    toast.innerHTML = `
      <div class="flex flex-col w-full max-w-xs p-4 rounded-lg shadow ${this.getColorClasses(type).background} ${this.getColorClasses(type).text}" role="alert">
        <div class="flex items-center w-full">
          <div class="ml-3 text-sm font-semibold" data-cy="toast-title">${title}</div>
          ${
            !duration
              ? `
            <button type="button" data-toast-close class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 ${this.getColorClasses(type).hover}" aria-label="Close">
              <span class="sr-only">Close</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
          `
              : ""
          }
        </div>
        ${body ? `<div class="ml-3 text-sm font-normal mt-1 whitespace-pre-wrap break-words" data-cy="toast-body">${body}</div>` : ""}
        ${
          action
            ? `<button type="button" data-toast-action class="ml-3 mt-1 text-sm font-semibold underline underline-offset-2 cursor-pointer text-left">${action.label}</button>`
            : ""
        }
      </div>
    `;

    if (!duration) {
      const closeButton = toast.querySelector("[data-toast-close]");
      if (closeButton) {
        closeButton.addEventListener("click", () =>
          this.dismissElement(toast, toastId),
        );
      }
    }

    if (action) {
      const actionButton = toast.querySelector("[data-toast-action]");
      if (actionButton) {
        actionButton.addEventListener("click", () => {
          this.dismissElement(toast, toastId);
          action.onClick();
        });
      }
    }

    if (this.toastTimers[toastId]) {
      clearTimeout(this.toastTimers[toastId]);
      delete this.toastTimers[toastId];
    }

    // if there's an existing toast with the same ID, remove before adding the new one
    const existingToast = this.toasts.get(toastId);
    if (existingToast) {
      const { element, timeoutId } = existingToast;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(toastId);
    }
    this.toastContainer.appendChild(toast);

    let timeoutId: any;
    if (duration !== null) {
      timeoutId = setTimeout(() => {
        this.removeToast(toastId);
      }, duration);
    }

    this.toasts.set(toastId, {
      element: toast,
      timeoutId,
    });

    return toastId;
  }

  private dismissElement(element: HTMLElement, toastId?: string): void {
    if (toastId) {
      const tracked = this.toasts.get(toastId);
      if (tracked?.element === element) {
        if (tracked.timeoutId) {
          clearTimeout(tracked.timeoutId);
        }
        this.toasts.delete(toastId);
      }
      if (this.toastTimers[toastId]) {
        clearTimeout(this.toastTimers[toastId]);
        delete this.toastTimers[toastId];
      }
    }

    if (!element.parentNode) {
      return;
    }

    element.classList.remove("translate-x-0");
    element.classList.add("translate-x-full");

    setTimeout(() => {
      element.parentNode?.removeChild(element);
    }, 300);
  }

  private removeToastWithAnimation(toastId: string) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;
    this.dismissElement(toast.element, toastId);
  }

  public removeToast(toastId: string) {
    if (this.toastTimers[toastId]) {
      clearTimeout(this.toastTimers[toastId]);
    }
    this.toastTimers[toastId] = setTimeout(() => {
      this.removeToastWithAnimation(toastId);
      delete this.toastTimers[toastId];
    }, 0);
  }

  ngOnDestroy() {
    // clean up any remaining timers
    Object.keys(this.toastTimers).forEach((id) => {
      if (this.toastTimers[id]) {
        clearTimeout(this.toastTimers[id]);
      }
    });
  }

  private getColorClasses(type: ToastType): {
    background: string;
    text: string;
    hover: string;
  } {
    switch (type) {
      case "success":
        return {
          background: "bg-emerald-400",
          text: "text-white",
          hover: "hover:bg-emerald-500",
        };
      case "error":
        return {
          background: "bg-red-500",
          text: "text-white",
          hover: "hover:bg-red-600",
        };
      case "warning":
        return {
          background: "bg-yellow-500",
          text: "text-white",
          hover: "hover:bg-yellow-400",
        };
      case "info":
      default:
        return {
          background: "bg-sky-950",
          text: "text-white",
          hover: "hover:bg-sky-900",
        };
    }
  }
}
