import { AdvisorSeoMetadata } from "./advisor.types";

export const ADVISOR_PAGE_TITLE = "Server Advisor";

export const ADVISOR_PAGE_DESCRIPTION =
  "Compare a baseline server against workload-aware alternatives and surface the best cloud replacement options based on performance, cost efficiency, memory, and GPU constraints. Use the Spare Cores Server Advisor to explore recommendations, refine the workload inputs, and share the resulting query with your team.";

export const ADVISOR_RESULTS_PANEL_DESCRIPTION =
  "Default advisor columns focus on the requested hardware fields while keeping server-detail navigation immediately available.";

export const ADVISOR_SEO: AdvisorSeoMetadata = {
  title: "Server Advisor - Spare Cores",
  description:
    "Compare a baseline server against workload-aware alternatives with the Spare Cores Server Advisor. Explore recommendations based on performance, cost, memory, and GPU requirements, then share the advisor link with your team.",
  keywords:
    "server advisor, cloud servers, workload recommendations, cost efficiency, performance, spare cores",
};

export const ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE =
  "No recommended servers available.";
