const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function focusTarget(host: HTMLElement): HTMLElement {
  if (host.matches("button, a[href], [tabindex]")) {
    return host;
  }

  return host.querySelector<HTMLElement>("button, a[href]") ?? host;
}

export function isKeyboardActivation(event: MouseEvent): boolean {
  return event.detail === 0;
}

export function focusableItems(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );
}

export function focusFirst(panel: HTMLElement) {
  focusableItems(panel)[0]?.focus();
}
