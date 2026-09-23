export function pushBrowserQueryState(
  encodedQuery: string | null | undefined,
): void {
  const path = canonicalizeComparePath(window.location.pathname);
  const hash = window.location.hash;

  if (encodedQuery?.length) {
    window.history.pushState({}, "", `${path}?${encodedQuery}${hash}`);
    return;
  }

  window.history.pushState({}, "", `${path}${hash}`);
}

export function canonicalizeComparePath(pathname: string): string {
  if (/^\/servers\/compare\/[^/]+$/.test(pathname)) {
    return "/servers/compare";
  }
  if (/^\/databases\/compare\/[^/]+$/.test(pathname)) {
    return "/databases/compare";
  }
  return pathname;
}

export function canonicalizeCompareUrl(url: string): string {
  const [pathAndQuery] = url.split("#");
  const queryIndex = pathAndQuery.indexOf("?");
  const pathname =
    queryIndex >= 0 ? pathAndQuery.slice(0, queryIndex) : pathAndQuery;
  const search = queryIndex >= 0 ? pathAndQuery.slice(queryIndex) : "";
  return `${canonicalizeComparePath(pathname)}${search}`;
}
