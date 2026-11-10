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

  function setup(): ApplicationRef {
    TestBed.configureTestingModule({ providers: [provideE2eReadiness()] });
    return TestBed.inject(ApplicationRef);
  }

  it("marks the document as hydrated once the app is stable in e2e runs", async () => {
    win[E2E_WINDOW_FLAG] = true;
    const appRef = setup();

    expect(document.documentElement.dataset["scHydrated"]).toBeUndefined();

    await appRef.whenStable();

    expect(document.documentElement.dataset["scHydrated"]).toBe("true");
  });

  it("leaves the document unmarked outside e2e runs", async () => {
    await setup().whenStable();

    expect(document.documentElement.dataset["scHydrated"]).toBeUndefined();
  });
});
