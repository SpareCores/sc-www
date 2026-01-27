import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OnDestroy } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  /** The title text to display on the first line of the toast notification */
  title: string;
  /** Optional body text to display below the title */
  body?: string;
  /** The type/style of toast - 'success', 'error', 'warning', or 'info' (default: 'info') */
  type?: ToastType;
  /** Duration in ms to show the toast. If null, toast requires manual dismissal (default: null) */
  duration?: number | null;
  /** Optional unique ID for the toast, so that it can be referenced/removed later. If not provided, one will be auto-generated */
  id?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ToastService implements OnDestroy {
  private toastContainer: HTMLDivElement | null = null;
  private toasts = new Map<string, { element: HTMLElement, timeoutId?: any }>();
  private platformId = inject(PLATFORM_ID);
  private toastTimers: { [id: string]: any } = {};

  constructor() {
    this.setupContainer();
  }

  private setupContainer() {
    if (isPlatformBrowser(this.platformId) && !this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'fixed top-[80px] right-4 z-50 flex flex-col items-end gap-1';
      document.body.appendChild(this.toastContainer);
    }
  }

  show(options: ToastOptions) {
    if (!isPlatformBrowser(this.platformId) || !this.toastContainer) return;

    const {
      title,
      body,
      type = 'info',
      duration = null,
      id
    } = options;

    const toastId = id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const toast = document.createElement('div');
    toast.className = 'rounded-lg p-2 transform transition-all duration-300 ease-in-out translate-x-0';

    toast.innerHTML = `
      <div class="flex flex-col w-full max-w-xs p-4 rounded-lg shadow ${this.getColorClasses(type).background} ${this.getColorClasses(type).text}" role="alert">
        <div class="flex items-center w-full">
          <div class="ml-3 text-sm font-semibold">${title}</div>
          ${!duration ? `
            <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 ${this.getColorClasses(type).hover}" aria-label="Close">
              <span class="sr-only">Close</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
          ` : ''}
        </div>
        ${body ? `<div class="ml-3 text-sm font-normal mt-1">${body}</div>` : ''}
      </div>
    `;

    if (!duration) {
      const closeButton = toast.querySelector('button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.removeToast(toastId));
      }
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
      timeoutId
    });

    return toastId;
  }

  private removeToastWithAnimation(toastId: string) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    const { element, timeoutId } = toast;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (element && element.parentNode) {
      element.classList.remove('translate-x-0');
      element.classList.add('translate-x-full');

      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.toasts.delete(toastId);
      }, 300);
    } else {
      this.toasts.delete(toastId);
    }
  }

  public removeToast(toastId: string) {
    this.toastTimers[toastId] = setTimeout(() => {
      this.removeToastWithAnimation(toastId);
      delete this.toastTimers[toastId];
    }, 0);
  }

  ngOnDestroy() {
    // clean up any remaining timers
    Object.keys(this.toastTimers).forEach(id => {
      if (this.toastTimers[id]) {
        clearTimeout(this.toastTimers[id]);
      }
    });
  }

  private getColorClasses(type: ToastType): { background: string; text: string; hover: string } {
    switch (type) {
      case 'success':
        return {
          background: 'bg-emerald-400',
          text: 'text-white',
          hover: 'hover:bg-emerald-500'
        };
      case 'error':
        return {
          background: 'bg-red-500',
          text: 'text-white',
          hover: 'hover:bg-red-600'
        };
      case 'warning':
        return {
          background: 'bg-yellow-500',
          text: 'text-white',
          hover: 'hover:bg-yellow-400'
        };
      case 'info':
      default:
        return {
          background: 'bg-sky-950',
          text: 'text-white',
          hover: 'hover:bg-sky-900'
        };
    }
  }
}