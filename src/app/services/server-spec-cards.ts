import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import {
  IdNameAndDescriptionAndCategory,
  Region,
  ServerPrice,
  Status,
  Zone,
} from "../../../sdk/data-contracts";
import { formatBooleanIconHtml } from "../components/charts/shared/server-compare-table.utils";
import {
  DetailsCardRow,
  DetailsCardSection,
} from "../components/details-card/details-card.types";
import { dedupeIdentityRows } from "../components/details-card/details-card.utils";
import { reduceUnitName } from "../pipes/pipe-utils";
import type { ExtendedServerPrice } from "../pages/server-details/server-details.types";
import { HIDDEN_SERVER_PROPERTY_IDS } from "../pages/server-details/server-details.constants";
import {
  AvailabilityPrice,
  AvailabilityRegion,
  ServerPropertyColumn,
  ServerSpecSections,
} from "./server-spec-cards.types";
import {
  PROPERTY_CATEGORY_DEFINITIONS,
  RESOURCE_CATEGORIES,
  SERVER_IDENTITY_ROW_IDS,
} from "./server-spec-cards.constants";

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
      if (
        !price.region ||
        (allocation !== "spot" && allocation !== "ondemand")
      ) {
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

  buildAvailabilitySections(
    regions: AvailabilityRegion[],
  ): DetailsCardSection[] {
    return [
      {
        name: "Availability",
        columns: ["Region / ID", "Spot", "Ondemand"],
        rows: regions.map((region) => ({
          id: `${region.vendor_id}_${region.region_id}`,
          name: region.display_name,
          detail: region.api_reference,
          values: [
            this.formatAvailabilityPrice(region.spot),
            this.formatAvailabilityPrice(region.ondemand),
          ],
          warning: region.inactive
            ? this.getInactivePriceNote(region.inactiveObservedAt)
            : undefined,
        })),
      },
    ];
  }

  private formatAvailabilityPrice(price: AvailabilityPrice): string {
    return price.price
      ? `${price.price} ${price.currency}/${reduceUnitName(price.unit)}`
      : "-";
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
        rows: [] as DetailsCardRow[],
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

      group.rows.push({
        id: property.id,
        name: property.name,
        values: [value],
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

    const metadataRows =
      categorizedSections.find((category) => category.category === "meta")
        ?.rows || [];
    const cpuRows =
      categorizedSections.find((category) => category.category === "cpu")
        ?.rows || [];

    return {
      metadataSections: [
        {
          name: "Server Metadata",
          rows: dedupeIdentityRows(metadataRows, SERVER_IDENTITY_ROW_IDS),
        },
      ],
      processorSections: [
        {
          name: "CPU",
          rows: cpuRows,
        },
      ],
      resourceSections: categorizedSections
        .filter((category) => RESOURCE_CATEGORIES.includes(category.category))
        .map((category) => ({
          name: category.name,
          columns: [category.name, ""],
          rows: category.rows,
        }))
        .filter((category) => category.rows.length > 0),
    };
  }
}
