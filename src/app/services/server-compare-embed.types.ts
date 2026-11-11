import type { ExtendedServerDetails } from "../pages/server-details/server-details.types";

export interface ServerCompareEmbedDetails {
  servers: ExtendedServerDetails[];
  instanceProperties: any[];
  benchmarkMeta: any;
  benchmarkCategories: any[];
  instancePropertyCategories: any[];
}
