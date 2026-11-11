import { Injectable, inject } from "@angular/core";
import {
  Benchmark,
  Database,
  DatabasePrice,
  DatabaseSecurityFeature,
  PriceUnit,
  Region,
  Vendor,
} from "../../../sdk/data-contracts";
import { PgbenchScore } from "../components/charts/line/benchmark-line-chart.types";
import {
  CompareDeltaView,
  formatCompareDeltaLabel,
  formatCompareSignedPercentageDeltaLabel,
  getBestNumericCompareCellStyle,
  toCompareDeltaView,
} from "../components/charts/shared/server-compare-table.utils";
import { AdvisorUi } from "../pages/advisor/advisor-ui";
import { formatKebabTitle } from "../pipes/pipe-utils";
import { ComparedDatabase } from "./compare-selection";
import { PGBENCH_PEAK_BENCHMARK_ID } from "./database-pgbench.constants";
import { DATABASE_SCHEMA_PROPERTIES } from "./database-schema.constants";
import { DatabaseUnderlyingServer } from "./database-underlying-server";
import { KeeperAPI } from "./keeper-api";
import {
  ComparePropertyRow,
  ComparePropertySection,
  LoadedCompareDatabase,
  LoadedDatabaseCompare,
} from "./database-compare-specs.types";
import {
  BEST_COMPARE_CELL_STYLE,
  LOWER_IS_BETTER_ROW_IDS,
} from "./database-compare-specs.constants";

@Injectable({ providedIn: "root" })
export class DatabaseCompareSpecs {
  private keeperAPI = inject(KeeperAPI);
  private advisorUi = inject(AdvisorUi);
  private underlyingServer = inject(DatabaseUnderlyingServer);

  async load(
    instances: ComparedDatabase[],
    currency: string,
  ): Promise<LoadedDatabaseCompare> {
    const [benchmarkMeta, vendors, regions, ...databases] = await Promise.all([
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
      ...instances.map((instance) =>
        Promise.all([
          this.keeperAPI.getDatabase(instance.vendor, instance.database),
          this.keeperAPI.getDatabasePrices(instance.vendor, instance.database, {
            currency,
          }),
          this.keeperAPI.getDatabaseBenchmarks(
            instance.vendor,
            instance.database,
          ),
        ]),
      ),
    ]);

    return {
      benchmarkMeta: (benchmarkMeta?.body || []) as Benchmark[],
      databases: databases.map(
        ([databaseResponse, pricesResponse, scoresResponse]) =>
          this.toLoadedDatabase(
            databaseResponse.body as Database,
            (pricesResponse.body || []) as DatabasePrice[],
            (scoresResponse.body || []) as PgbenchScore[],
            (vendors?.body || []) as Vendor[],
            (regions?.body || []) as Region[],
          ),
      ),
    };
  }

  async attachUnderlyingServers(
    databases: LoadedCompareDatabase[],
  ): Promise<void> {
    await Promise.all(
      databases.map(async (database) => {
        if (!database.server_id) {
          return;
        }
        const { server } = await this.underlyingServer.load(database, false);
        database.underlyingServer = server;
      }),
    );
  }

  columnWidth(displayName: string | undefined): string {
    return `max(10.5rem, ${(displayName?.length ?? 0) + 3}ch)`;
  }

  bestCellStyle(row: ComparePropertyRow, databaseIndex: number): string {
    return getBestNumericCompareCellStyle(
      row.rawValues[databaseIndex],
      row.rawValues,
      BEST_COMPARE_CELL_STYLE,
      row.lowerIsBetter || LOWER_IS_BETTER_ROW_IDS.has(row.id),
    );
  }

  shouldShowDeltaRow(row: ComparePropertyRow, baselineIndex: number): boolean {
    if (baselineIndex < 0 || row.rawValues[baselineIndex] === null) {
      return false;
    }

    return row.rawValues.some(
      (value, index) => index !== baselineIndex && value !== null,
    );
  }

  rowDelta(
    row: ComparePropertyRow,
    databaseIndex: number,
    baselineIndex: number,
  ): CompareDeltaView | null {
    if (
      databaseIndex === baselineIndex ||
      !this.shouldShowDeltaRow(row, baselineIndex)
    ) {
      return null;
    }

    const candidateValue = row.rawValues[databaseIndex];
    const baselineValue = row.rawValues[baselineIndex];
    if (candidateValue === null || baselineValue === null) {
      return null;
    }

    const lowerIsBetter =
      row.lowerIsBetter || LOWER_IS_BETTER_ROW_IDS.has(row.id);
    const delta = lowerIsBetter
      ? this.advisorUi.buildPriceDelta(candidateValue, baselineValue)
      : this.advisorUi.buildComparableResourceDelta(
          candidateValue,
          baselineValue,
        );

    return toCompareDeltaView(
      delta,
      lowerIsBetter
        ? formatCompareSignedPercentageDeltaLabel
        : formatCompareDeltaLabel,
    );
  }

  private toLoadedDatabase(
    database: Database,
    prices: DatabasePrice[],
    scores: PgbenchScore[],
    vendors: Vendor[],
    regions: Region[],
  ): LoadedCompareDatabase {
    const loaded: LoadedCompareDatabase = {
      ...database,
      vendor: vendors.find((vendor) => vendor.vendor_id === database.vendor_id),
      prices: prices
        .map((price) => ({
          ...price,
          region: regions.find(
            (region) =>
              region.vendor_id === price.vendor_id &&
              region.region_id === price.region_id,
          ),
        }))
        .sort((a, b) => a.price - b.price),
      benchmark_scores: scores,
    };

    loaded.bestHourPrice = loaded.prices?.find(
      (price) => price.unit === PriceUnit.Hour,
    );
    loaded.bestMonthPrice = loaded.prices?.find(
      (price) => price.unit === PriceUnit.Month,
    );
    return loaded;
  }

  buildPropertySections(
    databases: LoadedCompareDatabase[],
  ): ComparePropertySection[] {
    const sections: Array<{
      name: string;
      fields: Array<{
        id: string;
        name: string;
        value: (database: LoadedCompareDatabase) => unknown;
        raw?: (database: LoadedCompareDatabase) => number | null;
        lowerIsBetter?: boolean;
      }>;
    }> = [
      {
        name: "",
        fields: [
          {
            id: "vendor",
            name: "Vendor",
            value: (d) => d.vendor?.logo || d.vendor?.name || d.vendor_id,
          },
          { id: "name", name: "Name", value: (d) => d.name },
          {
            id: "display_name",
            name: "Display Name",
            value: (d) => d.display_name,
          },
          {
            id: "api_reference",
            name: "API Reference",
            value: (d) => d.api_reference,
          },
          { id: "family", name: "Family", value: (d) => d.family },
          { id: "status", name: "Status", value: (d) => d.status },
        ],
      },
      {
        name: "Engine",
        fields: [
          { id: "engine", name: "Engine", value: (d) => d.engine },
          {
            id: "wire_protocol",
            name: "Wire Protocol",
            value: (d) => d.wire_protocol,
          },
          {
            id: "engine_versions",
            name: "Engine Versions",
            value: (d) => this.formatList(d.engine_versions),
          },
          {
            id: "auto_upgrade_versions",
            name: "Auto Upgrade Versions",
            value: (d) => this.formatBoolean(d.auto_upgrade_versions),
          },
          {
            id: "custom_config",
            name: "Custom Config",
            value: (d) => this.formatBoolean(d.custom_config),
          },
          {
            id: "custom_extensions",
            name: "Custom Extensions",
            value: (d) => this.formatBoolean(d.custom_extensions),
          },
        ],
      },
      {
        name: "Capacity",
        fields: [
          {
            id: "vcpus",
            name: "vCPUs",
            value: (d) => d.vcpus,
            raw: (d) => this.toRawNumber(d.vcpus),
          },
          {
            id: "memory_amount",
            name: "Memory",
            value: (d) =>
              d.memory_amount === null || d.memory_amount === undefined
                ? null
                : `${(d.memory_amount / 1024).toFixed(1)} GiB`,
            raw: (d) => this.toRawNumber(d.memory_amount),
          },
          {
            id: "storage_size",
            name: "Bundled Storage",
            value: (d) =>
              d.storage_size === null || d.storage_size === undefined
                ? null
                : `${d.storage_size} GB`,
            raw: (d) => this.toRawNumber(d.storage_size),
          },
          {
            id: "storage_extra_min",
            name: "Extra Storage Min",
            value: (d) =>
              d.storage_extra_min === null || d.storage_extra_min === undefined
                ? null
                : `${d.storage_extra_min} GB`,
            raw: (d) => this.toRawNumber(d.storage_extra_min),
          },
          {
            id: "storage_extra_max",
            name: "Extra Storage Max",
            value: (d) =>
              d.storage_extra_max === null || d.storage_extra_max === undefined
                ? null
                : `${d.storage_extra_max} GB`,
            raw: (d) => this.toRawNumber(d.storage_extra_max),
          },
          {
            id: "storage_extra_autosize",
            name: "Storage Autosize",
            value: (d) => this.formatBoolean(d.storage_extra_autosize),
          },
          {
            id: "max_read_replicas",
            name: "Max Read Replicas",
            value: (d) => d.max_read_replicas,
            raw: (d) => this.toRawNumber(d.max_read_replicas),
          },
          {
            id: "sla",
            name: "SLA",
            value: (d) =>
              d.sla === null || d.sla === undefined ? null : `${d.sla}%`,
            raw: (d) => this.toRawNumber(d.sla),
          },
        ],
      },
      {
        name: "Features",
        fields: [
          {
            id: "ha",
            name: "High Availability",
            value: (d) => this.formatList(d.ha),
          },
          {
            id: "ha_strategy",
            name: "HA Strategy",
            value: (d) => this.formatList(d.ha_strategy),
          },
          {
            id: "scheduled_backups",
            name: "Scheduled Backups",
            value: (d) => this.formatBoolean(d.scheduled_backups),
          },
          {
            id: "continuous_backups",
            name: "Continuous Backups (days)",
            value: (d) => d.continuous_backups,
            raw: (d) => this.toRawNumber(d.continuous_backups),
          },
          {
            id: "connection_pool",
            name: "Connection Pool",
            value: (d) => this.formatBoolean(d.connection_pool),
          },
          {
            id: "system_monitoring",
            name: "System Monitoring",
            value: (d) => this.formatBoolean(d.system_monitoring),
          },
          {
            id: "database_monitoring",
            name: "Database Monitoring",
            value: (d) => this.formatBoolean(d.database_monitoring),
          },
          {
            id: "autotuning_advice",
            name: "Autotuning Advice",
            value: (d) => this.formatBoolean(d.autotuning_advice),
          },
          {
            id: "autotuning_apply",
            name: "Autotuning Apply",
            value: (d) => this.formatBoolean(d.autotuning_apply),
          },
        ],
      },
      {
        name: "Security",
        fields: [
          {
            id: "disk_encryption",
            name: "Disk Encryption",
            value: (d) => this.formatBoolean(d.disk_encryption),
          },
          ...this.buildSecurityFeatureFields(databases),
        ],
      },
    ];

    const alwaysShowSectionNames = new Set(["Capacity", "Features"]);

    return sections
      .map((section) => ({
        name: section.name,
        rows: section.fields
          .map((field) => ({
            id: field.id,
            name: field.name,
            values: databases.map((database) =>
              field.id === "vendor"
                ? this.toVendorDisplay(database)
                : this.toDisplayValue(field.value(database)),
            ),
            rawValues: databases.map((database) =>
              field.raw ? field.raw(database) : null,
            ),
            description: DATABASE_SCHEMA_PROPERTIES[field.id]?.description,
            lowerIsBetter: field.lowerIsBetter,
          }))
          .filter((row) =>
            alwaysShowSectionNames.has(section.name) || row.id === "vendor"
              ? true
              : row.values.some((value) => value !== "-"),
          ),
      }))
      .filter((section) => section.rows.length > 0);
  }

  private buildSecurityFeatureFields(
    databases: LoadedCompareDatabase[],
  ): Array<{
    id: string;
    name: string;
    value: (database: LoadedCompareDatabase) => unknown;
  }> {
    const present = new Set<string>();
    for (const database of databases) {
      for (const feature of database.security_features || []) {
        present.add(feature);
      }
    }

    const knownFeatures = Object.values(DatabaseSecurityFeature);
    const orderedFeatures = [
      ...knownFeatures.filter((feature) => present.has(feature)),
      ...[...present]
        .filter(
          (feature) =>
            !knownFeatures.includes(feature as DatabaseSecurityFeature),
        )
        .sort(),
    ];

    return orderedFeatures.map((feature) => ({
      id: feature,
      name: formatKebabTitle(feature),
      value: (database: LoadedCompareDatabase) =>
        (database.security_features || []).includes(
          feature as DatabaseSecurityFeature,
        )
          ? "check"
          : "x",
    }));
  }

  buildPriceRows(databases: LoadedCompareDatabase[]): ComparePropertyRow[] {
    return [
      {
        id: "best_hour",
        name: "Best Hourly Price",
        values: databases.map((database) =>
          this.formatPrice(database.bestHourPrice),
        ),
        rawValues: databases.map((database) =>
          this.toRawNumber(database.bestHourPrice?.price),
        ),
        lowerIsBetter: true,
      },
      this.buildCostEfficiencyRow(databases),
      {
        id: "best_month",
        name: "Best Monthly Price",
        values: databases.map((database) =>
          this.formatPrice(database.bestMonthPrice),
        ),
        rawValues: databases.map((database) =>
          this.toRawNumber(database.bestMonthPrice?.price),
        ),
        lowerIsBetter: true,
      },
    ].filter((row) =>
      row.values.some((value) => value !== "-" && value !== ""),
    );
  }

  private buildCostEfficiencyRow(
    databases: LoadedCompareDatabase[],
  ): ComparePropertyRow {
    const rawValues = databases.map((database) => {
      const peakScore = database.benchmark_scores?.find(
        (score) => score.benchmark_id === PGBENCH_PEAK_BENCHMARK_ID,
      )?.score;
      const hourlyPrice = database.bestHourPrice?.price;
      if (
        typeof peakScore !== "number" ||
        !Number.isFinite(peakScore) ||
        typeof hourlyPrice !== "number" ||
        !Number.isFinite(hourlyPrice) ||
        hourlyPrice <= 0
      ) {
        return null;
      }
      return peakScore / hourlyPrice;
    });

    return {
      id: "cost_efficiency",
      name: "Cost-efficiency",
      description:
        "Peak pgbench performance per price ratio showing how much throughput you get for $1/hour.",
      values: rawValues.map((value) =>
        value === null ? "" : value.toFixed(2),
      ),
      rawValues,
    };
  }

  private formatPrice(price?: DatabasePrice): string {
    if (!price) {
      return "-";
    }
    const rounded =
      price.price < 1 ? price.price.toPrecision(2) : price.price.toFixed(2);
    return `${rounded} ${price.currency}/${price.unit}`;
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

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  }

  private toVendorDisplay(database: LoadedCompareDatabase): string {
    if (database.vendor?.logo) {
      return `logo:${database.vendor.logo}`;
    }
    return database.vendor?.name || database.vendor_id || "-";
  }

  private toRawNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    return null;
  }
}
