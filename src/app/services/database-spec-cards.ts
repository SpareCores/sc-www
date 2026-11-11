import { Injectable } from "@angular/core";
import { DatabasePrice, Region } from "../../../sdk/data-contracts";
import {
  DetailsCardSection,
  DetailsRowInput,
} from "../components/details-card/details-card.types";
import {
  buildDetailsRows,
  dedupeIdentityRows,
} from "../components/details-card/details-card.utils";
import { formatKebabTitle, reduceUnitName } from "../pipes/pipe-utils";
import { DATABASE_SCHEMA_PROPERTIES } from "./database-schema.constants";
import {
  DatabaseSpecSections,
  LoadedDatabase,
} from "./database-spec-cards.types";
import { DATABASE_IDENTITY_ROW_IDS } from "./database-spec-cards.constants";

@Injectable({ providedIn: "root" })
export class DatabaseSpecCards {
  attachPrices(
    prices: DatabasePrice[],
    regions: Region[],
  ): (DatabasePrice & { region?: Region })[] {
    return prices
      .map((price) => ({
        ...price,
        region: regions.find(
          (region) =>
            region.vendor_id === price.vendor_id &&
            region.region_id === price.region_id,
        ),
      }))
      .sort((a, b) => a.price - b.price);
  }

  buildAvailabilitySections(
    prices: (DatabasePrice & { region?: Region })[],
  ): DetailsCardSection[] {
    return [
      {
        name: "Availability & Pricing",
        columns: ["Region / ID", "HA", "HA Strategy", "Price"],
        emptyText: "No prices available for this database.",
        rows: prices.map((price) => ({
          id: [price.region_id, price.ha, price.ha_strategy, price.unit].join(
            "_",
          ),
          name: price.region?.display_name || price.region_id,
          detail: price.region?.api_reference || price.region_id,
          values: [
            price.ha || "none",
            price.ha_strategy || "none",
            price.price === null || price.price === undefined
              ? "-"
              : `${price.price} ${price.currency || "USD"}/${reduceUnitName(
                  price.unit,
                )}`,
          ],
        })),
      },
    ];
  }

  buildSections(database: LoadedDatabase): DatabaseSpecSections {
    return {
      metadataSections: [
        {
          name: "Database Metadata",
          rows: dedupeIdentityRows(
            this.rows(
              [
                { id: "name", name: "Name", value: database.name },
                {
                  id: "display_name",
                  name: "Display Name",
                  value: database.display_name,
                },
                {
                  id: "api_reference",
                  name: "API Reference",
                  value: database.api_reference,
                },
                {
                  id: "database_id",
                  name: "Database ID",
                  value: database.database_id,
                },
                { id: "family", name: "Family", value: database.family },
                {
                  id: "server_id",
                  name: "Underlying Server",
                  ...this.formatUnderlyingServer(database),
                },
                { id: "status", name: "Status", value: database.status },
              ],
              true,
            ),
            DATABASE_IDENTITY_ROW_IDS,
          ),
        },
      ],
      engineSections: [
        {
          name: "Engine",
          rows: this.rows([
            { id: "engine", name: "Engine", value: database.engine },
            {
              id: "wire_protocol",
              name: "Wire Protocol",
              value: database.wire_protocol,
            },
            {
              id: "engine_versions",
              name: "Engine Versions",
              value: this.formatList(database.engine_versions),
            },
            {
              id: "auto_upgrade_versions",
              name: "Auto Upgrade Versions",
              value: this.formatBoolean(database.auto_upgrade_versions),
            },
            {
              id: "custom_config",
              name: "Custom Config",
              value: this.formatBoolean(database.custom_config),
            },
            {
              id: "custom_extensions",
              name: "Custom Extensions",
              value: this.formatBoolean(database.custom_extensions),
            },
          ]),
        },
      ],
      capacitySections: [
        {
          name: "Capacity",
          rows: this.rows([
            { id: "vcpus", name: "vCPUs", value: database.vcpus },
            {
              id: "memory_amount",
              name: "Memory",
              value:
                database.memory_amount === null ||
                database.memory_amount === undefined
                  ? null
                  : `${(database.memory_amount / 1024).toFixed(1)} GiB`,
            },
            {
              id: "storage_size",
              name: "Bundled Storage",
              value: this.formatGigabytes(database.storage_size),
            },
            {
              id: "storage_extra_min",
              name: "Extra Storage Min",
              value: this.formatGigabytes(database.storage_extra_min),
            },
            {
              id: "storage_extra_max",
              name: "Extra Storage Max",
              value: this.formatGigabytes(database.storage_extra_max),
            },
            {
              id: "storage_extra_autosize",
              name: "Storage Autosize",
              value: this.formatBoolean(database.storage_extra_autosize),
            },
            {
              id: "max_read_replicas",
              name: "Max Read Replicas",
              value: database.max_read_replicas,
            },
            {
              id: "sla",
              name: "SLA",
              value:
                database.sla === null || database.sla === undefined
                  ? null
                  : `${database.sla}%`,
            },
          ]),
        },
      ],
      featureSections: [
        {
          name: "Features",
          rows: this.rows([
            {
              id: "ha",
              name: "High Availability",
              value: this.formatList(database.ha),
            },
            {
              id: "ha_strategy",
              name: "HA Strategy",
              value: this.formatList(database.ha_strategy),
            },
            {
              id: "scheduled_backups",
              name: "Scheduled Backups",
              value: this.formatBoolean(database.scheduled_backups),
            },
            {
              id: "continuous_backups",
              name: "Continuous Backups (days)",
              value: database.continuous_backups,
            },
            {
              id: "connection_pool",
              name: "Connection Pool",
              value: this.formatBoolean(database.connection_pool),
            },
            {
              id: "system_monitoring",
              name: "System Monitoring",
              value: this.formatBoolean(database.system_monitoring),
            },
            {
              id: "database_monitoring",
              name: "Database Monitoring",
              value: this.formatBoolean(database.database_monitoring),
            },
            {
              id: "autotuning_advice",
              name: "Autotuning Advice",
              value: this.formatBoolean(database.autotuning_advice),
            },
            {
              id: "autotuning_apply",
              name: "Autotuning Apply",
              value: this.formatBoolean(database.autotuning_apply),
            },
          ]),
        },
      ],
      securitySections: [
        {
          name: "Security",
          rows: this.rows([
            {
              id: "disk_encryption",
              name: "Disk Encryption",
              value: this.formatBoolean(database.disk_encryption),
            },
            ...(database.security_features || []).map((feature) => ({
              id: feature,
              name: formatKebabTitle(feature),
              value: "check",
            })),
          ]),
        },
      ],
    };
  }

  private formatUnderlyingServer(database: LoadedDatabase): {
    value: unknown;
    routerLink?: string[];
  } {
    if (database.underlyingServer) {
      const { display_name, api_reference } = database.underlyingServer;
      return {
        value: display_name,
        routerLink: ["/server", database.vendor_id, api_reference],
      };
    }

    return { value: database.server_id };
  }

  private rows(items: DetailsRowInput[], useSchemaDescriptions = false) {
    return buildDetailsRows(items, (id) =>
      useSchemaDescriptions
        ? DATABASE_SCHEMA_PROPERTIES[id]?.description
        : undefined,
    );
  }

  private formatGigabytes(value: number | null | undefined): string | null {
    return value === null || value === undefined ? null : `${value} GB`;
  }

  private formatBoolean(value: boolean | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value ? "check" : "x";
  }

  private formatList(value: unknown): string | null {
    if (!Array.isArray(value) || !value.length) {
      return null;
    }
    return value.join(", ");
  }
}
