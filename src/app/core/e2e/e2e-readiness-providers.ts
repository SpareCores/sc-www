import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  PLATFORM_ID,
  afterNextRender,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from "@angular/core";

export const E2E_WINDOW_FLAG = "__scE2e";

export function injectIsE2eRun(): boolean {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return false;
  }

  const win = inject(DOCUMENT).defaultView as
    | (Window & { [E2E_WINDOW_FLAG]?: boolean })
    | null;

  return win?.[E2E_WINDOW_FLAG] === true;
}

export function provideE2eReadiness() {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(markHydratedForE2E),
  ]);
}

function markHydratedForE2E() {
  if (!injectIsE2eRun()) {
    return;
  }

  const document = inject(DOCUMENT);
  afterNextRender(() => {
    document.documentElement.dataset["scHydrated"] = "true";
  });
}
