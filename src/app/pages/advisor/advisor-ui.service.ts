import { Injectable } from "@angular/core";
import {
  Allocation,
  PriceUnit,
  ServerPKs,
  ServerPrice,
} from "../../../../sdk/data-contracts";
import { BestPriceAllocationType } from "../../tools/shared_data";
import { formatNumberInputValue } from "../../pipes/pipe-utils";
import { ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE } from "./advisor.constants";
import {
  AdvisorBaselinePriceAggregate,
  AdvisorBaselineServer,
  AdvisorCompareTarget,
  AdvisorMetricDelta,
  AdvisorSummaryAlert,
} from "./advisor.types";
import { matchesAdvisorBaselineServer } from "./advisor.utils";

const ADVISOR_EMPTY_VALUE = "-";
const ADVISOR_MONTHLY_HOURS = 730;

type AdvisorMonthlyPriceSource = Pick<
  ServerPrice,
  "allocation" | "unit" | "price"
> & {
  price_monthly?: number | null;
};

@Injectable({
  providedIn: "root",
})
export class AdvisorUiService {
  buildUtilizationSummaryContext(
    baselineScore: number | null | undefined,
    targetScore: number | null | undefined,
  ): string | null {
    const normalizedBaselineScore = this.normalizeFiniteNumber(baselineScore);
    const normalizedTargetScore = this.normalizeFiniteNumber(targetScore);

    if (normalizedBaselineScore === null || normalizedTargetScore === null) {
      return null;
    }

    return `of ${this.formatScore(normalizedBaselineScore)}; target score: ${this.formatScore(normalizedTargetScore)}`;
  }

  buildBaselinePriceAggregate(
    prices: ServerPrice[],
    options?: {
      bestPriceAllocation?: BestPriceAllocationType["slug"];
      currency?: string | null;
      regionId?: string | null;
    },
  ): AdvisorBaselinePriceAggregate {
    const scopedPrices = prices.filter((price) => {
      return this.matchesBaselinePriceScope(
        price,
        options?.regionId || null,
        options?.currency || null,
      );
    });

    const minSpotPrice = this.getMinimumPrice(
      scopedPrices.filter((price) => price.allocation === Allocation.Spot),
    );
    const minOndemandPrice = this.getMinimumPrice(
      scopedPrices.filter(
        (price) =>
          price.allocation === Allocation.Ondemand &&
          price.unit === PriceUnit.Hour,
      ),
    );
    const minOndemandMonthlyPrice =
      scopedPrices
        .map((price) => this.getOndemandMonthlyPrice(price))
        .filter((price): price is number => price !== null)
        .sort((left, right) => left - right)[0] ?? null;

    return {
      min_price: this.resolveBestPrice(
        options?.bestPriceAllocation || "ANY",
        minSpotPrice,
        minOndemandPrice,
        minOndemandMonthlyPrice,
      ),
      min_price_spot: minSpotPrice,
      min_price_ondemand: minOndemandPrice,
      min_price_ondemand_monthly: minOndemandMonthlyPrice,
    };
  }

  buildBenchmarkScoreDelta(
    candidateScore: number | null | undefined,
    baselineScore: number | null | undefined,
  ): AdvisorMetricDelta {
    return this.buildRelativeDelta(candidateScore, baselineScore, false);
  }

  buildBenchmarkScorePerPrice(
    baselineScore: number | null | undefined,
    baselinePrice: number | null | undefined,
  ): number | null {
    const normalizedBaselineScore = this.normalizeFiniteNumber(baselineScore);
    const normalizedBaselinePrice = this.normalizeFiniteNumber(baselinePrice);

    if (
      normalizedBaselineScore === null ||
      normalizedBaselinePrice === null ||
      normalizedBaselinePrice <= 0
    ) {
      return null;
    }

    return normalizedBaselineScore / normalizedBaselinePrice;
  }

  buildBenchmarkScorePerPriceDelta(
    candidateScorePerPrice: number | null | undefined,
    baselineScore: number | null | undefined,
    baselinePrice: number | null | undefined,
  ): AdvisorMetricDelta {
    return this.buildRelativeDelta(
      candidateScorePerPrice,
      this.buildBenchmarkScorePerPrice(baselineScore, baselinePrice),
      false,
    );
  }

  buildPriceDelta(
    candidatePrice: number | null | undefined,
    baselinePrice: number | null | undefined,
  ): AdvisorMetricDelta {
    return this.buildRelativeDelta(candidatePrice, baselinePrice, true);
  }

  getOndemandMonthlyPrice(price: AdvisorMonthlyPriceSource): number | null {
    if (price.allocation !== Allocation.Ondemand) {
      return null;
    }

    const explicitMonthlyPrice = this.normalizeFiniteNumber(
      price.price_monthly,
    );

    if (explicitMonthlyPrice !== null) {
      return explicitMonthlyPrice;
    }

    const normalizedPrice = this.normalizeFiniteNumber(price.price);

    if (normalizedPrice === null) {
      return null;
    }

    if (price.unit === PriceUnit.Month) {
      return normalizedPrice;
    }

    if (price.unit === PriceUnit.Hour) {
      return normalizedPrice * ADVISOR_MONTHLY_HOURS;
    }

    return null;
  }

  buildComparableResourceDelta(
    candidateValue: number | null | undefined,
    baselineValue: number | null | undefined,
  ): AdvisorMetricDelta {
    return this.buildRelativeDelta(candidateValue, baselineValue, false);
  }

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
      .sort((left, right) => this.compareBaselineServers(left, right))
      .slice(0, limit);
  }

  private compareBaselineServers(
    left: Pick<
      AdvisorBaselineServer,
      "vcpus" | "memory_amount" | "vendor_id" | "api_reference"
    >,
    right: Pick<
      AdvisorBaselineServer,
      "vcpus" | "memory_amount" | "vendor_id" | "api_reference"
    >,
  ): number {
    const vcpuDifference =
      this.getBaselineServerNumericSortValue(left.vcpus) -
      this.getBaselineServerNumericSortValue(right.vcpus);

    if (vcpuDifference !== 0) {
      return vcpuDifference;
    }

    const memoryDifference =
      this.getBaselineServerNumericSortValue(left.memory_amount) -
      this.getBaselineServerNumericSortValue(right.memory_amount);

    if (memoryDifference !== 0) {
      return memoryDifference;
    }

    const vendorDifference = left.vendor_id.localeCompare(right.vendor_id);

    if (vendorDifference !== 0) {
      return vendorDifference;
    }

    return left.api_reference.localeCompare(right.api_reference);
  }

  private getBaselineServerNumericSortValue(value: number | null | undefined) {
    return value ?? Number.POSITIVE_INFINITY;
  }

  buildMissingInputsMessage(missingInputs: string[]): string {
    if (!missingInputs.length) {
      return ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE;
    }

    if (missingInputs.length === 1) {
      return `Please select ${missingInputs[0]} to get started.`;
    }

    const leading = missingInputs.slice(0, -1).join(", ");
    const trailing = missingInputs[missingInputs.length - 1];
    return `Please select ${leading} and ${trailing} to get started.`;
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
    return this.formatGiBValue(item.memory_amount);
  }

  formatGpuMemory(
    item: Pick<ServerPKs, "gpu_memory_min" | "gpu_memory_total">,
    stat: "min" | "total" = "total",
  ): string {
    const memory = stat === "min" ? item.gpu_memory_min : item.gpu_memory_total;

    if (memory === null || memory === undefined) {
      return ADVISOR_EMPTY_VALUE;
    }

    return this.formatGiBValue(memory);
  }

  formatStorage(item: Pick<ServerPKs, "storage_size">): string {
    if (item.storage_size === null || item.storage_size === undefined) {
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
      return Number.parseFloat(value.toPrecision(2)).toString();
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

  private matchesBaselinePriceScope(
    price: ServerPrice,
    regionId: string | null,
    currency: string | null,
  ): boolean {
    if (regionId && price.region_id !== regionId) {
      return false;
    }

    if (currency && price.currency !== currency) {
      return false;
    }

    return this.normalizeFiniteNumber(price.price) !== null;
  }

  private getMinimumPrice(prices: ServerPrice[]): number | null {
    return prices.reduce<number | null>((lowestPrice, price) => {
      const normalizedPrice = this.normalizeFiniteNumber(price.price);

      if (normalizedPrice === null) {
        return lowestPrice;
      }

      if (lowestPrice === null || normalizedPrice < lowestPrice) {
        return normalizedPrice;
      }

      return lowestPrice;
    }, null);
  }

  private resolveBestPrice(
    bestPriceAllocation: BestPriceAllocationType["slug"],
    minSpotPrice: number | null,
    minOndemandPrice: number | null,
    minOndemandMonthlyPrice: number | null,
  ): number | null {
    switch (bestPriceAllocation) {
      case "SPOT_ONLY":
        return minSpotPrice;
      case "ONDEMAND_ONLY":
        return minOndemandPrice;
      case "MONTHLY":
        return minOndemandMonthlyPrice;
      case "ANY":
      default:
        return this.resolveNormalizedBestPrice(
          minSpotPrice,
          minOndemandPrice,
          minOndemandMonthlyPrice,
        );
    }
  }

  private resolveNormalizedBestPrice(
    minSpotPrice: number | null,
    minOndemandPrice: number | null,
    minOndemandMonthlyPrice: number | null,
  ): number | null {
    const comparablePrices = [
      {
        actualPrice: minSpotPrice,
        comparableHourlyPrice: minSpotPrice,
      },
      {
        actualPrice: minOndemandPrice,
        comparableHourlyPrice: minOndemandPrice,
      },
      {
        actualPrice: minOndemandMonthlyPrice,
        comparableHourlyPrice:
          minOndemandMonthlyPrice === null
            ? null
            : minOndemandMonthlyPrice / ADVISOR_MONTHLY_HOURS,
      },
    ].filter(
      (
        price,
      ): price is { actualPrice: number; comparableHourlyPrice: number } => {
        return (
          price.actualPrice !== null && price.comparableHourlyPrice !== null
        );
      },
    );

    return (
      comparablePrices.sort((left, right) => {
        return left.comparableHourlyPrice - right.comparableHourlyPrice;
      })[0]?.actualPrice ?? null
    );
  }

  private buildRelativeDelta(
    candidateValue: number | null | undefined,
    baselineValue: number | null | undefined,
    preferLower: boolean,
  ): AdvisorMetricDelta {
    const normalizedCandidateValue = this.normalizeFiniteNumber(candidateValue);
    const normalizedBaselineValue = this.normalizeFiniteNumber(baselineValue);

    if (
      normalizedCandidateValue === null ||
      normalizedBaselineValue === null ||
      normalizedBaselineValue <= 0
    ) {
      return {
        baselineValue: normalizedBaselineValue,
        candidateValue: normalizedCandidateValue,
        percentageDelta: null,
        tone: "neutral",
      };
    }

    const percentageDelta =
      ((normalizedCandidateValue - normalizedBaselineValue) /
        normalizedBaselineValue) *
      100;

    if (percentageDelta === 0) {
      return {
        baselineValue: normalizedBaselineValue,
        candidateValue: normalizedCandidateValue,
        percentageDelta: 0,
        tone: "neutral",
      };
    }

    return {
      baselineValue: normalizedBaselineValue,
      candidateValue: normalizedCandidateValue,
      percentageDelta,
      tone: preferLower
        ? percentageDelta < 0
          ? "positive"
          : "negative"
        : percentageDelta > 0
          ? "positive"
          : "negative",
    };
  }

  private formatPresentValue(value: unknown): string {
    return value === null || value === undefined || value === ""
      ? ADVISOR_EMPTY_VALUE
      : String(value);
  }

  private formatGiBValue(valueInMiB: number | null | undefined): string {
    if (valueInMiB === null || valueInMiB === undefined) {
      return ADVISOR_EMPTY_VALUE;
    }

    const valueInGiB = valueInMiB / 1024;
    const formattedValue = Number.isInteger(valueInGiB)
      ? `${formatNumberInputValue(valueInGiB, 0)}.0`
      : formatNumberInputValue(valueInGiB, 1);

    return `${formattedValue} GiB`;
  }

  private normalizeFiniteNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
}
