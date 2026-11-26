import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Signal,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";

export const breakpoints = {
  lg: "64rem",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function watchBelowBreakpoint(breakpoint: Breakpoint): Signal<boolean> {
  const isBelow = signal(false);
  const document = inject(DOCUMENT);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const view = document.defaultView;
    if (!view || destroyRef.destroyed) {
      return;
    }

    const query = view.matchMedia(`(width < ${breakpoints[breakpoint]})`);
    const onChange = (event: MediaQueryListEvent) => isBelow.set(event.matches);
    isBelow.set(query.matches);
    query.addEventListener("change", onChange);
    destroyRef.onDestroy(() => query.removeEventListener("change", onChange));
  });

  return isBelow.asReadonly();
}
