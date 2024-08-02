import type { Config, Context } from "@netlify/edge-functions";

// [[redirects]]
//   from = "/ingest/static/*"
//   to = "https://eu-assets.i.posthog.com/static/:splat"
//   host = "eu-assets.i.posthog.com"
//   status = 200
//   force = true

// [[redirects]]
//   from = "/ingest/*"
//   to = "https://eu.i.posthog.com/:splat"
//   host = "eu.i.posthog.com"
//   status = 200
//   force = true

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  console.log(url);
  if (url.pathname.startsWith('/pgp/')) {
    const pgOrigin = url.pathname.startsWith('/pgp/static/') ? 'https://eu-assets.i.posthog.com' : 'https://eu.i.posthog.com';
    const pgUrl = pgOrigin + url.pathname.replace('/pgp/', '/')
    return new URL(pgUrl, request.url);
  }
  return fetch(request);
};

export const config: Config = {
  // PostHog Proxy
  path: "/pgp/*",
};
