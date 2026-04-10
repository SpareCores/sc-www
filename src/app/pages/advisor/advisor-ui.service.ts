import { Injectable } from "@angular/core";
import { ServerPKs } from "../../../../sdk/data-contracts";
import { ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE } from "./advisor.constants";
import {
  AdvisorBaselineServer,
  AdvisorCompareTarget,
  AdvisorSummaryAlert,
} from "./advisor.types";
import { matchesAdvisorBaselineServer } from "./advisor.utils";

const ADVISOR_EMPTY_VALUE = "-";

@Injectable({
  providedIn: "root",
})
export class AdvisorUiService {
  filterBaselineServers(
    servers: AdvisorBaselineServer[],
    searchValue: string,
    minCharacters = 2,
    limit = 20,
  ): AdvisorBaselineServer[] {
    if (searchValue.trim().length < minCharacters) {
      return [];
    }

    return servers
      .filter((server) => matchesAdvisorBaselineServer(server, searchValue))
      .slice(0, limit);
  }

  buildMissingInputsMessage(missingInputs: string[]): string {
    if (!missingInputs.length) {
      return ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE;
    }

    if (missingInputs.length === 1) {
      return `Please choose ${missingInputs[0]} as it is required for your advice.`;
    }

    const leading = missingInputs.slice(0, -1).join(", ");
    const trailing = missingInputs[missingInputs.length - 1];
    return `Please choose ${leading} and ${trailing} as they are required for your advice.`;
  }

  buildRecommendationSummary(totalResults: number): AdvisorSummaryAlert {
    if (totalResults > 0) {
      return {
        tone: "positive",
        title: `${totalResults} recommended server${totalResults === 1 ? "" : "s"} found`,
        body: "These recommendations reflect your current advisor inputs and search filters.",
      };
    }

    return {
      tone: "neutral",
      title: "No matches yet",
      body: "Adjust the advisor inputs or filters to discover matching server recommendations.",
    };
  }

  formatMemory(item: Pick<ServerPKs, "memory_amount">): string {
    return `${((item.memory_amount || 0) / 1024).toFixed(1)} GiB`;
  }

  formatGpuMemory(
    item: Pick<ServerPKs, "gpu_memory_min" | "gpu_memory_total">,
    stat: "min" | "total" = "total",
  ): string {
    const memory = stat === "min" ? item.gpu_memory_min : item.gpu_memory_total;

    if (!memory) {
      return ADVISOR_EMPTY_VALUE;
    }

    return `${(memory / 1024).toFixed(1)} GiB`;
  }

  formatStorage(item: Pick<ServerPKs, "storage_size">): string {
    if (!item.storage_size) {
      return ADVISOR_EMPTY_VALUE;
    }

    if (item.storage_size < 1000) {
      return `${item.storage_size} GB`;
    }

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  formatScore(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return ADVISOR_EMPTY_VALUE;
    }

    if (value < 1) {
      return value.toPrecision(1);
    }

    if (value < 100) {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }

    return Number.isInteger(value) ? value.toString() : value.toFixed(0);
  }

  showApiReference(
    item: Pick<ServerPKs, "display_name" | "api_reference">,
  ): boolean {
    return (
      item.display_name !== item.api_reference &&
      item.display_name !== item.api_reference.replace("Standard_", "")
    );
  }

  getTextValue(item: ServerPKs, key?: string): string {
    return this.formatPresentValue(this.getRecordValue(item, key));
  }

  formatPrice(item: ServerPKs, currencySlug: string, key?: string): string {
    const value = this.getRecordValue(item, key);

    if (value === null || value === undefined) {
      return ADVISOR_EMPTY_VALUE;
    }

    return `${value} ${currencySlug}`;
  }

  getModelDetail(item: ServerPKs, modelKey: "cpu_model" | "gpu_model"): string {
    return this.formatPresentValue(this.getRecordValue(item, modelKey));
  }

  formatNetworkSpeed(value: number | null | undefined): string {
    if (!value || value <= 0) {
      return ADVISOR_EMPTY_VALUE;
    }

    if (value < 1) {
      const mbps = value * 1000;
      const formatted = Number.isInteger(mbps)
        ? mbps.toString()
        : mbps.toFixed(1);
      return `${formatted} Mbps`;
    }

    const formatted = Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1);
    return `${formatted} Gbps`;
  }

  formatMonthlyTraffic(value: number | null | undefined): string {
    if (!value || value <= 0) {
      return ADVISOR_EMPTY_VALUE;
    }

    const isTiB = value >= 1024;
    const transformedValue = isTiB ? value / 1024 : value;
    const formatted = Number.isInteger(transformedValue)
      ? transformedValue.toString()
      : transformedValue.toFixed(1);
    return `${formatted} ${isTiB ? "TiB/mo" : "GiB/mo"}`;
  }

  formatIpv4(value: number | null | undefined): string {
    return !value || value <= 0 ? ADVISOR_EMPTY_VALUE : String(value);
  }

  getVendorLinkId(server: ServerPKs): string {
    const vendor = (server as { vendor?: { vendor_id?: string } }).vendor;
    return vendor?.vendor_id || server.vendor_id;
  }

  getVendorLogo(server: ServerPKs): string | null {
    const vendor = (server as { vendor?: { logo?: string | null } }).vendor;
    return vendor?.logo || null;
  }

  getVendorName(server: ServerPKs): string {
    const vendor = (server as { vendor?: { name?: string | null } }).vendor;
    return vendor?.name || server.vendor_id;
  }

  buildCompareTarget(server: {
    api_reference: string;
    vendor_id: string;
    display_name?: string | null;
  }): AdvisorCompareTarget {
    return {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name || server.api_reference,
    };
  }

  private getRecordValue(item: ServerPKs, key?: string): unknown {
    if (!key) {
      return null;
    }

    return (item as unknown as Record<string, unknown>)[key];
  }

  private formatPresentValue(value: unknown): string {
    return value === null || value === undefined || value === ""
      ? ADVISOR_EMPTY_VALUE
      : String(value);
  }
}
