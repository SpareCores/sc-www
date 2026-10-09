import {
  dismissPageHttpToasts,
  showInvalidUrlParamToast,
} from "./page-toast.helpers";

describe("page toast helpers", () => {
  it("dismissPageHttpToasts clears the transient toast and owned ids", () => {
    const clearTransientHttpError = jasmine.createSpy(
      "clearTransientHttpError",
    );
    const removeToast = jasmine.createSpy("removeToast");

    dismissPageHttpToasts(
      {
        clearTransientHttpError,
        removeToast,
      } as any,
      ["query-error", "bad-url"],
    );

    expect(clearTransientHttpError).toHaveBeenCalled();
    expect(removeToast).toHaveBeenCalledWith("query-error");
    expect(removeToast).toHaveBeenCalledWith("bad-url");
  });

  it("showInvalidUrlParamToast shows the standard Invalid URL toast in the browser", () => {
    const show = jasmine.createSpy("show");

    showInvalidUrlParamToast(
      {
        show,
      } as any,
      "browser",
      {
        id: "bad-url",
        body: "Select a valid item.",
      },
    );

    expect(show).toHaveBeenCalledOnceWith({
      title: "Invalid URL",
      body: "Select a valid item.",
      type: "error",
      id: "bad-url",
      action: undefined,
    });
  });

  it("showInvalidUrlParamToast does nothing outside the browser", () => {
    const show = jasmine.createSpy("show");

    showInvalidUrlParamToast(
      {
        show,
      } as any,
      "server",
      {
        id: "bad-url",
        body: "Select a valid item.",
      },
    );

    expect(show).not.toHaveBeenCalled();
  });
});
