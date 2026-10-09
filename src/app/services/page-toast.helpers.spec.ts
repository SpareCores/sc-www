import {
  dismissPageHttpToasts,
  showInvalidUrlParamToast,
} from "./page-toast.helpers";
import type { ToastService } from "./toast.service";

describe("page toast helpers", () => {
  it("dismissPageHttpToasts clears owned ids", () => {
    const toastService = jasmine.createSpyObj<
      Pick<ToastService, "removeToast">
    >("toastService", ["removeToast"]);

    dismissPageHttpToasts(toastService, ["query-error", "bad-url"]);

    expect(toastService.removeToast).toHaveBeenCalledWith("query-error");
    expect(toastService.removeToast).toHaveBeenCalledWith("bad-url");
  });

  it("showInvalidUrlParamToast shows the standard Invalid URL toast in the browser", () => {
    const toastService = jasmine.createSpyObj<Pick<ToastService, "show">>(
      "toastService",
      ["show"],
    );

    showInvalidUrlParamToast(toastService, "browser" as unknown as object, {
      id: "bad-url",
      body: "Select a valid item.",
    });

    expect(toastService.show).toHaveBeenCalledOnceWith({
      title: "Invalid URL",
      body: "Select a valid item.",
      type: "error",
      id: "bad-url",
      action: undefined,
    });
  });

  it("showInvalidUrlParamToast does nothing outside the browser", () => {
    const toastService = jasmine.createSpyObj<Pick<ToastService, "show">>(
      "toastService",
      ["show"],
    );

    showInvalidUrlParamToast(toastService, "server" as unknown as object, {
      id: "bad-url",
      body: "Select a valid item.",
    });

    expect(toastService.show).not.toHaveBeenCalled();
  });
});
