import { EmbedWidgetOption } from "../components/embed-dialog/embed-dialog.types";
import { DatabaseCardDefinition } from "./database-embed.types";

export const DATABASE_PGBENCH_WIDGET_ID = "pgbench";

export const UNDERLYING_SERVER_PGBENCH_WIDGET_ID = "underlying_server_pgbench";

export const DATABASE_COMPARE_SPECS_WIDGET_ID = "generic";

export const DATABASE_CARDS: DatabaseCardDefinition[] = [
  {
    id: "metadata",
    name: "Database Metadata",
    cardId: "details",
    fixedRows: true,
    sections: (sections) => sections.metadataSections,
  },
  {
    id: "availability",
    name: "Availability & Pricing",
    cardId: "availability",
    fixedRows: false,
    sections: (_sections, availability) => availability,
  },
  {
    id: "engine",
    name: "Engine",
    cardId: "engine",
    fixedRows: true,
    sections: (sections) => sections.engineSections,
  },
  {
    id: "capacity",
    name: "Capacity",
    cardId: "capacity",
    fixedRows: true,
    sections: (sections) => sections.capacitySections,
  },
  {
    id: "features",
    name: "Features",
    cardId: "features",
    fixedRows: true,
    sections: (sections) => sections.featureSections,
  },
  {
    id: "security",
    name: "Security",
    cardId: "security",
    fixedRows: true,
    sections: (sections) => sections.securitySections,
  },
];

export const DATABASE_SPEC_CARD_WIDGETS: EmbedWidgetOption[] =
  DATABASE_CARDS.map(({ id, name }) => ({ id, name }));

export const DATABASE_COMPARE_SPECS_WIDGET: EmbedWidgetOption = {
  id: DATABASE_COMPARE_SPECS_WIDGET_ID,
  name: "Database Specs and Prices",
};
