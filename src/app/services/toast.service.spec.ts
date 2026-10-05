import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TRANSIENT_HTTP_TOAST_ID } from "./http-error-toast";
import { ToastService } from "./toast.service";

describe("ToastService", () => {
  let service: ToastService;

  function clearToasts() {
    document.querySelectorAll('[data-cy="toast"]').forEach((el) => el.remove());
  }

  function toastByTitle(title: string): Element | undefined {
    return Array.from(document.querySelectorAll('[data-cy="toast"]')).find(
      (el) =>
        el.querySelector('[data-cy="toast-title"]')?.textContent === title,
    );
  }

  beforeEach(() => {
    clearToasts();
    TestBed.configureTestingModule({
      providers: [ToastService, { provide: PLATFORM_ID, useValue: "browser" }],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    clearToasts();
  });

  it("renders title and body in an alert", () => {
    service.show({
      title: "Request timed out",
      body: "Please try again.",
      type: "error",
      id: "toast-service-spec-render",
    });

    const toast = toastByTitle("Request timed out");
    expect(toast).toBeTruthy();
    expect(toast?.querySelector('[role="alert"]')).toBeTruthy();
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      "Please try again.",
    );
  });

  it("replaces an existing toast with the same id", () => {
    service.show({
      title: "First",
      body: "A",
      type: "error",
      id: "toast-service-spec-stable",
    });
    service.show({
      title: "Second",
      body: "B",
      type: "error",
      id: "toast-service-spec-stable",
    });

    expect(toastByTitle("First")).toBeUndefined();
    const toast = toastByTitle("Second");
    expect(toast).toBeTruthy();
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      "B",
    );
  });

  it("marks error toasts via data-toast-type", () => {
    service.show({
      title: "Error",
      type: "error",
      id: "toast-service-spec-err",
    });

    expect(toastByTitle("Error")?.getAttribute("data-toast-type")).toBe(
      "error",
    );
  });

  it("showTransientHttpError shows mapped toast and returns true", () => {
    expect(service.showTransientHttpError({ status: 500 })).toBe(true);
    expect(toastByTitle("Service temporarily unavailable")).toBeTruthy();
  });

  it("showTransientHttpError returns false for non-transient errors", () => {
    expect(service.showTransientHttpError({ status: 404 })).toBe(false);
    expect(document.querySelectorAll('[data-cy="toast"]').length).toBe(0);
  });

  it("clearTransientHttpError dismisses the stable transient toast id", () => {
    const remove = spyOn(service, "removeToast");
    service.clearTransientHttpError();
    expect(remove).toHaveBeenCalledWith(TRANSIENT_HTTP_TOAST_ID);
  });

  it("showTransientHttpError replaces a previous transient toast", () => {
    service.showTransientHttpError({ status: 500 });
    service.showTransientHttpError({ status: 408 });
    expect(toastByTitle("Service temporarily unavailable")).toBeUndefined();
    expect(toastByTitle("Request timed out")).toBeTruthy();
  });
});
