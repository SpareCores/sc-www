import { DatabaseCompareEmbedDetails } from "./database-embed.types";
import { ServerCompareEmbedDetails } from "./server-compare-embed.types";

export interface CompareEmbedModel {
  path: string;
  server?: ServerCompareEmbedDetails;
  database?: DatabaseCompareEmbedDetails;
}

export interface CompareEmbedResourceConfig {
  comparePath: string;
  listingPath: string;
  toastId: string;
  toastBody: string;
  toastActionLabel: string;
}
