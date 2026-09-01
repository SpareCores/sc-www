export function pushBrowserQueryState(
  encodedQuery: string | null | undefined,
): void {
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (encodedQuery?.length) {
    window.history.pushState({}, "", `${path}?${encodedQuery}${hash}`);
    return;
  }

  window.history.pushState({}, "", `${path}${hash}`);
}
