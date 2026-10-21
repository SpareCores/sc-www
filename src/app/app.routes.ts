import { Routes } from "@angular/router";
import { LandingPage } from "./pages/landing-page/landing-page";
import { ServerListing } from "./pages/server-listing/server-listing";
import { ServerPrices } from "./pages/server-prices/server-prices";
import { authGuard, blockLandingDuringAuthGuard } from "./core/auth";

export const routes: Routes = [
  {
    path: "",
    component: LandingPage,
    canActivate: [blockLandingDuringAuthGuard],
  },
  {
    path: "auth/callback",
    loadComponent: () =>
      import("./pages/auth-callback/auth-callback").then((m) => m.AuthCallback),
  },

  {
    path: "servers/compare",
    loadComponent: () =>
      import("./pages/server-compare/server-compare").then(
        (m) => m.ServerCompare,
      ),
  },
  {
    path: "servers/compare/:id",
    loadComponent: () =>
      import("./pages/server-compare/server-compare").then(
        (m) => m.ServerCompare,
      ),
  },
  { path: "servers", component: ServerListing },
  { path: "servers/:id", component: ServerListing },
  {
    path: "databases/compare",
    loadComponent: () =>
      import("./pages/database-compare/database-compare").then(
        (m) => m.DatabaseCompare,
      ),
  },
  {
    path: "databases/compare/:id",
    loadComponent: () =>
      import("./pages/database-compare/database-compare").then(
        (m) => m.DatabaseCompare,
      ),
  },
  {
    path: "databases",
    loadComponent: () =>
      import("./pages/database-listing/database-listing").then(
        (m) => m.DatabaseListing,
      ),
  },
  {
    path: "database/:vendor/:id",
    loadComponent: () =>
      import("./pages/database-details/database-details").then(
        (m) => m.DatabaseDetails,
      ),
  },
  {
    path: "advisor",
    loadComponent: () =>
      import("./pages/advisor/advisor").then((m) => m.Advisor),
  },
  { path: "server_prices", component: ServerPrices },
  {
    path: "server/:vendor/:id",
    loadComponent: () =>
      import("./pages/server-details/server-details").then(
        (m) => m.ServerDetails,
      ),
  },
  {
    path: "og/:vendor/:id",
    loadComponent: () =>
      import("./pages/server-og/server-og").then((m) => m.ServerOG),
  },

  {
    path: "debug",
    redirectTo: "navigator/benchmark-coverage",
    pathMatch: "full",
  },

  {
    path: "navigator/benchmark-coverage",
    loadComponent: () =>
      import("./pages/benchmark-coverage/benchmark-coverage").then(
        (m) => m.BenchmarkCoverage,
      ),
  },

  {
    path: "navigator/benchmark-workloads",
    loadComponent: () =>
      import("./pages/benchmark-workloads/benchmark-workloads").then(
        (c) => c.BenchmarkWorkloads,
      ),
  },

  {
    path: "article/:id",
    loadComponent: () =>
      import("./pages/article/article").then((m) => m.Article),
  },
  {
    path: "articles",
    loadComponent: () =>
      import("./pages/articles/articles").then((m) => m.Articles),
  },

  {
    path: "talks",
    loadComponent: () => import("./pages/talks/talks").then((m) => m.Talks),
  },

  {
    path: "legal",
    loadComponent: () =>
      import("./pages/legal-documents/legal-documents").then(
        (m) => m.LegalDocuments,
      ),
  },
  { path: "legal/tos", redirectTo: "legal/terms-of-service" },
  {
    path: "legal/:id",
    loadComponent: () => import("./pages/tos/tos").then((m) => m.TOS),
  },

  {
    path: "regions",
    loadComponent: () =>
      import("./pages/regions/regions").then((m) => m.Regions),
  },
  {
    path: "vendors",
    loadComponent: () =>
      import("./pages/vendors/vendors").then((m) => m.Vendors),
  },
  {
    path: "vendors/:vendorId",
    loadComponent: () =>
      import("./pages/vendor-details/vendor-details").then(
        (m) => m.VendorDetails,
      ),
  },
  {
    path: "storages",
    loadComponent: () =>
      import("./pages/storages/storages").then((m) => m.Storages),
  },
  {
    path: "traffic-prices",
    loadComponent: () =>
      import("./pages/traffic-prices/traffic-prices").then(
        (m) => m.TrafficPrices,
      ),
  },
  { path: "datacenters", redirectTo: "regions" },

  {
    path: "survey/:id",
    loadComponent: () =>
      import("./pages/survey-fill/survey-fill").then((m) => m.SurveyFill),
  },
  {
    path: "feedback/:id",
    loadComponent: () =>
      import("./pages/survey-fill/survey-fill").then((m) => m.SurveyFill),
  },

  {
    path: "embed/server/:vendor/:id/:chartname",
    loadComponent: () =>
      import("./pages/embedded-server-chart/embedded-server-chart").then(
        (m) => m.EmbeddedServerChart,
      ),
  },

  {
    path: "embed/compare/:chartname",
    loadComponent: () =>
      import("./pages/embedded-compare-chart/embedded-compare-chart").then(
        (m) => m.EmbeddedCompareChart,
      ),
  },

  {
    path: "contact",
    loadComponent: () =>
      import("./pages/contact/contact").then((m) => m.Contact),
  },
  {
    path: "bookmarks",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./pages/bookmarks/bookmarks").then((m) => m.Bookmarks),
  },
  {
    path: "about/partners",
    loadComponent: () =>
      import("./pages/partners/partners").then((c) => c.Partners),
  },
  {
    path: "about/spare-cores",
    loadComponent: () =>
      import("./pages/about/about-spare-cores").then((m) => m.AboutSpareCores),
  },
  {
    path: "about/navigator",
    loadComponent: () =>
      import("./pages/about/about-navigator").then((m) => m.AboutNavigator),
    data: { skipHydration: true },
  },
  {
    path: "about/resource-tracker",
    redirectTo: "article/metaflow-resource-tracker",
  },
  { path: "about/sentinel", redirectTo: "article/metaflow-resource-tracker" },
  { path: "about", redirectTo: "about/spare-cores" },
  { path: "navigator", redirectTo: "about/navigator" },

  {
    path: "hu/funding/bnl",
    loadComponent: () =>
      import("./pages/funding-information/funding-information").then(
        (c) => c.FundingInformation,
      ),
  },

  {
    path: "design",
    loadComponent: () => import("./pages/design/design").then((c) => c.Design),
  },

  { path: "**", redirectTo: "" },
];
