import { PLATFORM_ID } from "@angular/core";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import {
  QUERY_ERROR_SERVERS_TOAST_ID,
  SERVER_COMPARE_ERROR_TOAST_ID,
  VENDORS_ERROR_TOAST_ID,
} from "./toast-ids";
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

  it("showHttpError shows transient toast under the caller id when status is retryable", fakeAsync(() => {
    service.showHttpError(
      { status: 500 },
      { id: QUERY_ERROR_SERVERS_TOAST_ID },
    );

    expect(toastByTitle("Service temporarily unavailable")).toBeTruthy();
    expect(toastByTitle("Query error!")).toBeUndefined();

    service.removeToast(QUERY_ERROR_SERVERS_TOAST_ID);
    tick(0);
    tick(300);
    expect(toastByTitle("Service temporarily unavailable")).toBeUndefined();
  }));

  it("showHttpError replaces repeated retryable failures under the same caller id", () => {
    service.showHttpError(
      { status: 500 },
      { id: QUERY_ERROR_SERVERS_TOAST_ID },
    );
    service.showHttpError(
      { status: 429 },
      { id: QUERY_ERROR_SERVERS_TOAST_ID },
    );

    expect(document.querySelectorAll('[data-cy="toast"]').length).toBe(1);
    expect(toastByTitle("Service temporarily unavailable")).toBeUndefined();
    expect(toastByTitle("Too many requests")).toBeTruthy();
  });

  it("showHttpError keeps transient toasts under separate feature ids", () => {
    service.showHttpError(
      { status: 500 },
      { id: QUERY_ERROR_SERVERS_TOAST_ID },
    );
    service.showHttpError({ status: 429 }, { id: VENDORS_ERROR_TOAST_ID });

    expect(document.querySelectorAll('[data-cy="toast"]').length).toBe(2);
    expect(toastByTitle("Service temporarily unavailable")).toBeTruthy();
    expect(toastByTitle("Too many requests")).toBeTruthy();
  });

  it("showHttpError falls back to Query error! with detail for non-transient errors", () => {
    service.showHttpError(
      { status: 404, error: { detail: "Invalid filter" } },
      { id: QUERY_ERROR_SERVERS_TOAST_ID },
    );

    const toast = toastByTitle("Query error!");
    expect(toast).toBeTruthy();
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      "Invalid filter",
    );
  });

  it("showHttpError shows full JSON body for 422 validation responses", () => {
    const payload = {
      detail: [
        {
          type: "less_than_equal",
          loc: ["query", "vcpus_max"],
          msg: "Input should be less than or equal to 256",
          input: "500",
          ctx: { le: 256 },
        },
      ],
    };

    service.showHttpError(
      { status: 422, error: payload },
      { id: QUERY_ERROR_SERVERS_TOAST_ID, title: "Servers query error!" },
    );

    const toast = toastByTitle("Servers query error!");
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      JSON.stringify(payload, null, 2),
    );
  });

  it("escapes HTML in toast title and body", () => {
    service.show({
      title: `<img src=x onerror=alert(1)>`,
      body: `<script>alert("x")</script>`,
      type: "error",
      id: QUERY_ERROR_SERVERS_TOAST_ID,
    });

    const toast = toastByTitle(`<img src=x onerror=alert(1)>`);
    expect(toast).toBeTruthy();
    expect(toast?.innerHTML).not.toContain("<script>");
    expect(toast?.innerHTML).not.toContain("<img src=x");
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      `<script>alert("x")</script>`,
    );
  });

  it("showHttpError uses custom title and body when provided", () => {
    service.showHttpError(
      { status: 422 },
      {
        id: VENDORS_ERROR_TOAST_ID,
        title: "Failed to load vendors",
        body: "Custom body",
      },
    );

    const toast = toastByTitle("Failed to load vendors");
    expect(toast).toBeTruthy();
    expect(toast?.querySelector('[data-cy="toast-body"]')?.textContent).toBe(
      "Custom body",
    );
  });

  it("removeToast dismisses a toast after the exit animation", fakeAsync(() => {
    service.show({
      title: "Servers query error!",
      type: "error",
      id: QUERY_ERROR_SERVERS_TOAST_ID,
    });

    service.removeToast(QUERY_ERROR_SERVERS_TOAST_ID);
    tick(0);
    expect(toastByTitle("Servers query error!")).toBeTruthy();

    tick(300);
    expect(toastByTitle("Servers query error!")).toBeUndefined();
  }));

  it("removeToast during exit does not orphan a replacement toast", fakeAsync(() => {
    service.show({
      title: "First",
      type: "error",
      id: QUERY_ERROR_SERVERS_TOAST_ID,
    });

    service.removeToast(QUERY_ERROR_SERVERS_TOAST_ID);
    tick(0);

    service.show({
      title: "Second",
      type: "error",
      id: QUERY_ERROR_SERVERS_TOAST_ID,
    });

    tick(300);

    expect(toastByTitle("First")).toBeUndefined();
    expect(toastByTitle("Second")).toBeTruthy();

    service.removeToast(QUERY_ERROR_SERVERS_TOAST_ID);
    tick(0);
    tick(300);

    expect(toastByTitle("Second")).toBeUndefined();
  }));

  it("close dismisses an orphaned toast element not tracked by id", fakeAsync(() => {
    service.show({
      title: "Failed to load server comparison",
      type: "error",
      id: SERVER_COMPARE_ERROR_TOAST_ID,
    });

    const toast = toastByTitle(
      "Failed to load server comparison",
    ) as HTMLElement;
    expect(toast).toBeTruthy();

    (service as any).toasts.delete(SERVER_COMPARE_ERROR_TOAST_ID);

    toast
      .querySelector("[data-toast-close]")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    tick(300);

    expect(toastByTitle("Failed to load server comparison")).toBeUndefined();
  }));
});
