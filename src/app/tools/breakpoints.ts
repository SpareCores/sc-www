export const breakpoints = {
  lg: "64rem",
  wide: "75rem",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function isBelowBreakpoint(view: Window, breakpoint: Breakpoint) {
  return view.matchMedia(`(width < ${breakpoints[breakpoint]})`).matches;
}
