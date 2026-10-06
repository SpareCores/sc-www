import { HttpErrorResponse } from "@angular/common/http";
import {
  DEFAULT_HTTP_ERROR_DETAIL,
  getHttpErrorDetailMessage,
  getTransientHttpToast,
  TRANSIENT_HTTP_TOAST_ID,
} from "./http-error-toast";

describe("getHttpErrorDetailMessage", () => {
  it("returns backend detail for HttpErrorResponse", () => {
    expect(
      getHttpErrorDetailMessage(
        new HttpErrorResponse({
          status: 422,
          error: { detail: "Invalid filter" },
        }),
      ),
    ).toBe("Invalid filter");
  });

  it("returns detail from duck-typed HTTP errors", () => {
    expect(
      getHttpErrorDetailMessage({
        status: 422,
        error: { detail: "Duck typed" },
      }),
    ).toBe("Duck typed");
  });

  it("returns fallback for non-HTTP errors and empty detail", () => {
    expect(getHttpErrorDetailMessage(new Error("boom"))).toBe(
      DEFAULT_HTTP_ERROR_DETAIL,
    );
    expect(
      getHttpErrorDetailMessage(
        new HttpErrorResponse({ status: 422, error: { detail: "" } }),
      ),
    ).toBe(DEFAULT_HTTP_ERROR_DETAIL);
  });
});

describe("getTransientHttpToast", () => {
  function error(status: number): HttpErrorResponse {
    return new HttpErrorResponse({ status, statusText: "Error" });
  }

  it("maps status 0 network failures", () => {
    expect(getTransientHttpToast(error(0))).toEqual({
      title: "Connection problem",
      body: "We couldn't reach the service. Please try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    });
  });

  it("maps 408", () => {
    expect(getTransientHttpToast(error(408))).toEqual({
      title: "Request timed out",
      body: "The service took too long to respond. Please try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    });
  });

  it("maps 429", () => {
    expect(getTransientHttpToast(error(429))).toEqual({
      title: "Too many requests",
      body: "Please wait a moment and try again.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    });
  });

  it("maps 500", () => {
    expect(getTransientHttpToast(error(500))).toEqual({
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    });
  });

  it("maps 504", () => {
    expect(getTransientHttpToast(error(504))).toEqual({
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
      id: TRANSIENT_HTTP_TOAST_ID,
    });
  });

  it("returns null for 400", () => {
    expect(getTransientHttpToast(error(400))).toBeNull();
  });

  it("returns null for 404", () => {
    expect(getTransientHttpToast(error(404))).toBeNull();
  });

  it("returns null for non-status values", () => {
    expect(getTransientHttpToast(null)).toBeNull();
    expect(getTransientHttpToast(undefined)).toBeNull();
    expect(getTransientHttpToast("boom")).toBeNull();
    expect(getTransientHttpToast({ detail: "x" })).toBeNull();
  });
});
