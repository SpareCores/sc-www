import { showInvalidUrlParamToast } from "./page-toast.helpers";
import type { Toast } from "./toast";

describe("page toast helpers", () => {
  it("showInvalidUrlParamToast shows the standard Invalid URL toast in the browser", () => {
    const toastService = jasmine.createSpyObj<Pick<Toast, "show">>(
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
    const toastService = jasmine.createSpyObj<Pick<Toast, "show">>(
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
