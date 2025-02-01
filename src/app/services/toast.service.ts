import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  body?: string;
  type?: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastContainer: HTMLDivElement | null = null;
  private toasts: Map<string, { element: HTMLDivElement, timeoutId: number }> = new Map();
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'fixed top-[80px] right-4 z-50 flex flex-col items-end gap-2';
      document.body.appendChild(this.toastContainer);
    }
  }

  show(options: ToastOptions) {
    if (!isPlatformBrowser(this.platformId) || !this.toastContainer) return;

    const {
      title,
      body,
      type = 'info',
      duration = 3000
    } = options;

    const colorClasses = this.getColorClasses(type);
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const toastElement = document.createElement('div');
    toastElement.style.transition = 'all 300ms ease-in-out';
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateY(1rem)';
    toastElement.innerHTML = `
      <div class="flex flex-col w-full max-w-xs p-4 rounded-lg shadow ${colorClasses.background} ${colorClasses.text}" role="alert">
        <div class="flex items-center w-full">
          <div class="ml-3 text-sm font-semibold">${title}</div>
          <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 ${colorClasses.hover}" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
        ${body ? `<div class="ml-3 text-sm font-normal mt-1">${body}</div>` : ''}
      </div>
    `;

    const closeButton = toastElement.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.removeToast(toastId));
    }

    this.toastContainer.appendChild(toastElement);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toastElement.style.opacity = '1';
      toastElement.style.transform = 'translateY(0)';
    });

    const timeoutId = window.setTimeout(() => {
      this.removeToast(toastId);
    }, duration);

    this.toasts.set(toastId, { element: toastElement, timeoutId });
  }

  private removeToast(toastId: string) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    const { element, timeoutId } = toast;
    clearTimeout(timeoutId);

    element.style.opacity = '0';
    element.style.transform = 'translateY(-1rem)';

    element.addEventListener('transitionend', () => {
      element.remove();
      this.toasts.delete(toastId);
    }, { once: true });  // Ensure the listener is only called once
  }

  private getColorClasses(type: ToastType): { background: string; text: string; hover: string } {
    switch (type) {
      case 'success':
        return {
          background: 'bg-green-100 dark:bg-green-800',
          text: 'text-green-500 dark:text-green-200',
          hover: 'hover:bg-green-200 dark:hover:bg-green-700'
        };
      case 'error':
        return {
          background: 'bg-red-100 dark:bg-red-800',
          text: 'text-red-500 dark:text-red-200',
          hover: 'hover:bg-red-200 dark:hover:bg-red-700'
        };
      case 'warning':
        return {
          background: 'bg-yellow-100 dark:bg-yellow-800',
          text: 'text-yellow-500 dark:text-yellow-200',
          hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-700'
        };
      case 'info':
      default:
        return {
          background: 'bg-blue-100 dark:bg-blue-800',
          text: 'text-blue-500 dark:text-blue-200',
          hover: 'hover:bg-blue-200 dark:hover:bg-blue-700'
        };
    }
  }
} 