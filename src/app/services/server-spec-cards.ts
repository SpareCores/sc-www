import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import {
  IdNameAndDescriptionAndCategory,
  PriceUnit,
  Region,
  ServerPrice,
  Status,
  Zone,
} from "../../../sdk/data-contracts";
import { formatBooleanIconHtml } from "../components/charts/shared/server-compare-table.utils";
import {
  ServerPropertyRow,
  ServerPropertySection,
  ServerPropertyTooltip,
} from "../components/server-property-card/server-property-card";
import type { ExtendedServerPrice } from "../pages/server-details/server-details";
import { HIDDEN_SERVER_PROPERTY_IDS } from "../pages/server-details/server-details.constants";

export interface ServerPropertyColumn {
  id: string;
  unit?: string | null;
}

export interface ServerSpecSections {
  metadataSections: ServerPropertySection[];
  processorSections: ServerPropertySection[];
  resourceSections: ServerPropertySection[];
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

interface PropertyCategoryDefinition {
  name: string;
  category: string;
}

const PROPERTY_CATEGORY_DEFINITIONS: PropertyCategoryDefinition[] = [
  { name: "General", category: "meta" },
  { name: "CPU", category: "cpu" },
  { name: "Memory", category: "memory" },
  { name: "Accelerators", category: "gpu" },
  { name: "Storage", category: "storage" },
  { name: "Network", category: "network" },
];

const RESOURCE_CATEGORIES = ["memory", "gpu", "storage", "network"];

@Injectable({
  providedIn: "root",
})
export class ServerSpecCards {
  isOrderable(status: Status | undefined): boolean {
    return status === Status.Active || status === Status.PlannedForRetirement;
  }

  preparePrices(
    prices: ServerPrice[],
    serverStatus: Status | undefined,
    regions: Region[],
    zones: Zone[],
  ): ExtendedServerPrice[] {
    const isOrderable = this.isOrderable(serverStatus);

    return (JSON.parse(JSON.stringify(prices)) as ServerPrice[])
      .filter((price) => !isOrderable || price.status === Status.Active)
      .sort((a, b) => a.price - b.price)
      .map((price) => ({
        ...price,
        region: regions.find(
          (r) =>
            r.vendor_id === price.vendor_id && r.region_id === price.region_id,
        ),
        zone: zones.find(
          (z) =>
            z.vendor_id === price.vendor_id &&
            z.region_id === price.region_id &&
            z.zone_id === price.zone_id,
        ),
      }));
  }

  hasInactivePrices(prices: ServerPrice[]): boolean {
    return prices.some((price) => price.status !== Status.Active);
  }

  buildAvailabilityRegions(
    prices: ExtendedServerPrice[],
  ): AvailabilityRegion[] {
    const availabilityRegions: AvailabilityRegion[] = [];

    prices.forEach((price) => {
      const allocation = price.allocation || "spot";
      if (allocation !== "spot" && allocation !== "ondemand") {
        return;
      }

      const inactiveObservedAt =
        price.status !== Status.Active ? price.observed_at : undefined;
      let region = availabilityRegions.find(
        (r) =>
          r.vendor_id === price.vendor_id && r.region_id === price.region_id,
      );

      if (!region) {
        region = {
          vendor_id: price.vendor_id,
          region_id: price.region_id,
          display_name: price.region.display_name,
          api_reference: price.region.api_reference,
          inactive: price.status !== Status.Active,
          inactiveObservedAt,
          spot: {
            price: 0,
            unit: price.unit,
            count: 0,
            currency: price.currency,
          },
          ondemand: {
            price: 0,
            unit: price.unit,
            count: 0,
            currency: price.currency,
          },
        };
        availabilityRegions.push(region);
      } else {
        region.inactive ||= price.status !== Status.Active;
        if (
          inactiveObservedAt &&
          (!region.inactiveObservedAt ||
            inactiveObservedAt > region.inactiveObservedAt)
        ) {
          region.inactiveObservedAt = inactiveObservedAt;
        }
      }

      region[allocation].price += price.price;
      region[allocation].count++;
    });

    availabilityRegions.forEach((region) => {
      if (region.spot.count) {
        region.spot.price =
          Math.round((region.spot.price / region.spot.count) * 1000000) /
          1000000;
      }
      if (region.ondemand.count) {
        region.ondemand.price =
          Math.round(
            (region.ondemand.price / region.ondemand.count) * 1000000,
          ) / 1000000;
      }
    });

    return availabilityRegions.sort(
      (a, b) => a.ondemand.price - b.ondemand.price,
    );
  }

  getInactivePriceNote(observedAt: string | undefined): string {
    if (!observedAt) {
      return "Last known price, not currently orderable.";
    }

    const timestamp = /(Z|[+-]\d{2}:?\d{2})$/.test(observedAt)
      ? observedAt
      : `${observedAt}Z`;

    return `Last known price (at ${formatDate(timestamp, "yyyy-MM-dd HH:mm", "en-US", "UTC")} UTC), not currently orderable.`;
  }

  getProperty(server: object, column: ServerPropertyColumn) {
    const name = column.id;
    const prop = (server as Record<string, unknown>)[name];

    if (name === "hw_virt") {
      if (prop === true) {
        return formatBooleanIconHtml(true);
      }

      if (prop === false) {
        return formatBooleanIconHtml(false);
      }

      if (prop === undefined || prop === null) {
        return "-";
      }

      if (typeof prop === "string" && prop.trim().toLowerCase() === "none") {
        return "-";
      }
    }

    if (prop === undefined || prop === null || typeof prop === "boolean") {
      return undefined;
    }

    if (typeof prop === "string" && prop.trim().toLowerCase() === "none") {
      return undefined;
    }

    if (name === "storages") {
      let html = "<ul>";
      (prop as Record<string, unknown>[]).forEach((s) => {
        html += `<li>${s["size"]} GB ${s["storage_type"] ? s["storage_type"] : ""}${s["description"] ? " (" + s["description"] + ")" : ""}</li>`;
      });
      html += "</ul>";
      return html;
    }

    if (name === "accelerators") {
      let html = "<ul>";
      (prop as Record<string, unknown>[]).forEach((s) => {
        html += `<li>${s["manufacturer"] || ""} ${s["family"] || ""} ${s["model"] || ""} `;
        const fields = [
          "memory",
          "firmware_version",
          "bios_version",
          "graphics_clock",
        ];
        const field_names = [
          "Memory amount",
          "Firmware version",
          "BIOS version",
          "Clock rate",
        ];
        let extraData = "";
        for (let i = 0; i < fields.length; i++) {
          if (s[fields[i]]) {
            if (extraData.length > 0) {
              extraData += ", ";
            } else {
              extraData += "(";
            }
            extraData += `${field_names[i]}: ${s[fields[i]]}`;
          }
        }
        if (extraData.length > 0) {
          html += extraData + ")";
        }

        html += "</li>";
      });
      html += "</ul>";
      return html;
    }

    if (typeof prop === "number") {
      return this.roundBytes(prop, column.unit ?? "");
    }
    if (typeof prop === "string") {
      return prop;
    }
    if (Array.isArray(prop)) {
      return prop.join(", ");
    }

    return "-";
  }

  roundBytes(bytes: number, unit: string) {
    const sizes = ["byte", "KiB", "MiB", "GiB", "TB"];

    const idx = sizes.indexOf(unit);

    if (idx < 0 || bytes === 0) {
      return `${bytes} ${unit || ""}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(0) + " " + sizes[i + idx];
  }

  buildSections(
    server: object,
    fields: IdNameAndDescriptionAndCategory[],
  ): ServerSpecSections {
    const categorizedSections = PROPERTY_CATEGORY_DEFINITIONS.map(
      (definition) => ({
        name: definition.name,
        category: definition.category,
        properties: [] as ServerPropertyRow[],
      }),
    );

    fields.forEach((property) => {
      const group = categorizedSections.find(
        (category) => category.category === property.category,
      );
      const value = this.getProperty(server, property);
      if (!group || !value || HIDDEN_SERVER_PROPERTY_IDS.has(property.id)) {
        return;
      }

      group.properties.push({
        id: property.id,
        name: property.name,
        value,
        tooltips: property.description
          ? [
              {
                key: property.id,
                content: property.description,
              },
            ]
          : [],
      });
    });

    const metadataProperties =
      categorizedSections.find((category) => category.category === "meta")
        ?.properties || [];
    const cpuProperties =
      categorizedSections.find((category) => category.category === "cpu")
        ?.properties || [];

    return {
      metadataSections: [
        {
          name: "Server Metadata",
          properties: this.dedupeMetadataProperties(metadataProperties),
        },
      ],
      processorSections: [
        {
          name: "CPU",
          properties: cpuProperties,
        },
      ],
      resourceSections: categorizedSections
        .filter((category) => RESOURCE_CATEGORIES.includes(category.category))
        .map((category) => ({
          name: category.name,
          properties: category.properties,
        }))
        .filter((category) => category.properties.length > 0),
    };
  }

  private dedupeMetadataProperties(
    properties: ServerPropertyRow[],
  ): ServerPropertyRow[] {
    const nameProperty = properties.find((property) => property.id === "name");
    if (!nameProperty) {
      return properties;
    }

    const hiddenMetadataIds = new Set([
      "server_id",
      "api_reference",
      "display_name",
    ]);
    const identityPropertyIds = [
      "server_id",
      "name",
      "api_reference",
      "display_name",
    ];
    const matchingIdentityProperties = properties.filter(
      (property) =>
        property.id !== "name" &&
        identityPropertyIds.includes(property.id) &&
        this.normalizeComparableValue(property.value) ===
          this.normalizeComparableValue(nameProperty.value),
    );
    const shouldAggregateIdentityTooltips =
      matchingIdentityProperties.length > 0;
    const nameTooltips = shouldAggregateIdentityTooltips
      ? this.uniqueTooltips(
          [nameProperty, ...matchingIdentityProperties].flatMap(
            (property) => property.tooltips || [],
          ),
        )
      : nameProperty.tooltips || [];

    const filteredProperties = properties.filter((property) => {
      if (!hiddenMetadataIds.has(property.id)) {
        return true;
      }

      if (
        this.normalizeComparableValue(property.value) !==
        this.normalizeComparableValue(nameProperty.value)
      ) {
        return true;
      }

      return false;
    });

    return filteredProperties.map((property) => {
      if (property.id !== "name") {
        return property;
      }

      return {
        ...property,
        tooltips: nameTooltips,
      };
    });
  }

  private uniqueTooltips(tooltips: ServerPropertyTooltip[]) {
    const seen = new Set<string>();

    return tooltips.filter((tooltip) => {
      if (seen.has(tooltip.key)) {
        return false;
      }

      seen.add(tooltip.key);
      return true;
    });
  }

  private normalizeComparableValue(value: string) {
    return value
      .replace(/<[^>]*>/g, "")
      .trim()
      .toLowerCase();
  }
}
