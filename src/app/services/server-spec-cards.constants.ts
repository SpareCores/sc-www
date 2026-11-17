import { PropertyCategoryDefinition } from "./server-spec-cards.types";

export const PROPERTY_CATEGORY_DEFINITIONS: PropertyCategoryDefinition[] = [
  { name: "General", category: "meta" },
  { name: "CPU", category: "cpu" },
  { name: "Memory", category: "memory" },
  { name: "Accelerators", category: "gpu" },
  { name: "Storage", category: "storage" },
  { name: "Network", category: "network" },
];

export const RESOURCE_CATEGORIES = ["memory", "gpu", "storage", "network"];

export const SERVER_IDENTITY_ROW_IDS = [
  "server_id",
  "api_reference",
  "display_name",
];
