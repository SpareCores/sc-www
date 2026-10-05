import { HttpErrorResponse } from "@angular/common/http";
import { getTransientHttpToast } from "./http-error-toast";

describe("getTransientHttpToast", () => {
  function error(status: number): HttpErrorResponse {
    return new HttpErrorResponse({ status, statusText: "Error" });
  }

  it("maps 408", () => {
    expect(getTransientHttpToast(error(408))).toEqual({
      title: "Request timed out",
      body: "The service took too long to respond. Please try again.",
      type: "error",
    });
  });

  it("maps 429", () => {
    expect(getTransientHttpToast(error(429))).toEqual({
      title: "Too many requests",
      body: "Please wait a moment and try again.",
      type: "error",
    });
  });

  it("maps 500", () => {
    expect(getTransientHttpToast(error(500))).toEqual({
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
    });
  });

  it("maps 504", () => {
    expect(getTransientHttpToast(error(504))).toEqual({
      title: "Service temporarily unavailable",
      body: "We couldn't load the latest data. Please try again later.",
      type: "error",
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
