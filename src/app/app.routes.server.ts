import { RenderMode, PrerenderFallback, ServerRoute } from "@angular/ssr";
import allArticles from "../assets/articles/all.json";

// When building with a local backend (local-test config), skip all prerendering
// so the build doesn't hit localhost:8080 for /vendors, /regions, etc.
const isLocalBuild =
  import.meta.env.NG_APP_BACKEND_BASE_URI_SSR === "http://localhost:8080";

export const serverRoutes: ServerRoute[] = isLocalBuild
  ? [{ path: "**", renderMode: RenderMode.Server }]
  : ([
      // Static routes — prerendered at build time
      { path: "talks", renderMode: RenderMode.Prerender },
      { path: "vendors", renderMode: RenderMode.Prerender },
      { path: "regions", renderMode: RenderMode.Prerender },

      // Articles — all articles prerendered; unknown IDs fall back to SSR
      {
        path: "article/:id",
        renderMode: RenderMode.Prerender,
        fallback: PrerenderFallback.Server,
        async getPrerenderParams() {
          return allArticles.map((a: { filename: string }) => ({
            id: a.filename,
          }));
        },
      },

      // Dynamic routes — SSR (no param values known at build time)
      { path: "servers/:id", renderMode: RenderMode.Server },
      { path: "compare/:id", renderMode: RenderMode.Server },
      { path: "server/:vendor/:id", renderMode: RenderMode.Server },
      { path: "og/:vendor/:id", renderMode: RenderMode.Server },
      { path: "legal/:id", renderMode: RenderMode.Server },
      { path: "survey/:id", renderMode: RenderMode.Server },
      { path: "feedback/:id", renderMode: RenderMode.Server },
      {
        path: "embed/server/:vendor/:id/:chartname",
        renderMode: RenderMode.Server,
      },
      {
        path: "embed_debug/:vendor/:id/:chartname",
        renderMode: RenderMode.Server,
      },
      { path: "embed/compare/:chartname", renderMode: RenderMode.Server },
      { path: "embed_compare_debug/:chartname", renderMode: RenderMode.Server },

      // Everything else: SSR on demand
      { path: "**", renderMode: RenderMode.Server },
    ] as ServerRoute[]);
