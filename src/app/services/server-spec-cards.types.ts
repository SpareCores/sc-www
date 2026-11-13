import { PriceUnit } from "../../../sdk/data-contracts";
import { DetailsCardSection } from "../components/details-card/details-card.types";

export interface ServerPropertyColumn {
  id: string;
  unit?: string | null;
}

export interface ServerSpecSections {
  metadataSections: DetailsCardSection[];
  processorSections: DetailsCardSection[];
  resourceSections: DetailsCardSection[];
}

export interface AvailabilityPrice {
  price: number;
  unit: PriceUnit;
  count: number;
  currency?: string;
}

export interface AvailabilityRegion {
  vendor_id: string;
  region_id: string;
  display_name: string;
  api_reference: string;
  inactive: boolean;
  inactiveObservedAt?: string;
  spot: AvailabilityPrice;
  ondemand: AvailabilityPrice;
}

export interface PropertyCategoryDefinition {
  name: string;
  category: string;
}
