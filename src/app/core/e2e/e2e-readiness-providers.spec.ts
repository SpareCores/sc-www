import { ApplicationRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  E2E_WINDOW_FLAG,
  provideE2eReadiness,
} from "./e2e-readiness-providers";

describe("provideE2eReadiness", () => {
  const win = window as Window & { [E2E_WINDOW_FLAG]?: boolean };

  afterEach(() => {
    delete win[E2E_WINDOW_FLAG];
    delete document.documentElement.dataset["scHydrated"];
  });

  function renderOnce(): void {
    TestBed.configureTestingModule({ providers: [provideE2eReadiness()] });
    TestBed.inject(ApplicationRef).tick();
  }

  it("marks the document as hydrated after the first render in e2e runs", () => {
    win[E2E_WINDOW_FLAG] = true;

    renderOnce();

    expect(document.documentElement.dataset["scHydrated"]).toBe("true");
  });

  it("leaves the document unmarked outside e2e runs", () => {
    renderOnce();

    expect(document.documentElement.dataset["scHydrated"]).toBeUndefined();
  });
});
