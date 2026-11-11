import { ServerCardDefinition } from "./server-embed.types";

export const SERVER_CARD_WIDGETS: Record<string, ServerCardDefinition> = {
  metadata: {
    cardId: "details",
    cardTitle: "Server Metadata",
    fixedRows: true,
  },
  availability: {
    cardId: "availability",
    cardTitle: "Availability",
    fixedRows: false,
  },
  processor: { cardId: "processor", cardTitle: "Processor", fixedRows: true },
  system_resources: {
    cardId: "system_resources",
    cardTitle: "System Resources and Accelerators",
    fixedRows: true,
  },
};

export const PROPERTY_CARD_WIDGET_IDS = [
  "metadata",
  "processor",
  "system_resources",
];

export const NON_CHART_WIDGET_IDS = [
  ...Object.keys(SERVER_CARD_WIDGETS),
  "lstopo",
  "description",
];
