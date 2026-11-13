import { DestroyRef, Signal, signal } from "@angular/core";

export const breakpoints = {
  lg: "64rem",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function isBelowBreakpoint(view: Window, breakpoint: Breakpoint) {
  return view.matchMedia(`(width < ${breakpoints[breakpoint]})`).matches;
}

export function watchBelowBreakpoint(
  view: Window | null,
  breakpoint: Breakpoint,
  destroyRef: DestroyRef,
): Signal<boolean> {
  const isBelow = signal(false);
  if (!view) {
    return isBelow.asReadonly();
  }

  const query = view.matchMedia(`(width < ${breakpoints[breakpoint]})`);
  const onChange = (event: MediaQueryListEvent) => isBelow.set(event.matches);
  isBelow.set(query.matches);
  query.addEventListener("change", onChange);
  destroyRef.onDestroy(() => query.removeEventListener("change", onChange));

  return isBelow.asReadonly();
}
