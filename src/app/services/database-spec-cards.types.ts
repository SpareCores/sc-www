import {
  Database,
  DatabasePrice,
  Region,
  Vendor,
} from "../../../sdk/data-contracts";
import { DetailsCardSection } from "../components/details-card/details-card.types";

export type DatabaseUnderlyingServer = {
  display_name: string;
  api_reference: string;
  cpu_cores?: number;
  vcpus?: number;
};

export type LoadedDatabase = Database & {
  vendor?: Vendor;
  prices?: (DatabasePrice & { region?: Region })[];
  underlyingServer?: DatabaseUnderlyingServer;
};

export interface DatabaseSpecSections {
  metadataSections: DetailsCardSection[];
  engineSections: DetailsCardSection[];
  capacitySections: DetailsCardSection[];
  featureSections: DetailsCardSection[];
  securitySections: DetailsCardSection[];
}
