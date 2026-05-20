import { TestBed } from "@angular/core/testing";
import {
  Allocation,
  PriceUnit,
  ServerPrice,
} from "../../../../sdk/data-contracts";
import { AdvisorUiService } from "./advisor-ui.service";
import { AdvisorBaselineServer } from "./advisor.types";

describe("AdvisorUiService", () => {
  let service: AdvisorUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvisorUiService);
  });

  it("returns 0 for zero scores", () => {
    expect(service.formatScore(0)).toBe("0");
  });

  it("returns the empty value for nullish scores", () => {
    expect(service.formatScore(null)).toBe("-");
    expect(service.formatScore(undefined)).toBe("-");
  });

  it("filters baseline servers after two characters by default", () => {
    const servers: AdvisorBaselineServer[] = [
      { vendor_id: "gcp", api_reference: "n2-standard-4" },
      { vendor_id: "aws", api_reference: "c7g.large" },
    ];

    expect(service.filterBaselineServers(servers, "g")).toEqual([]);
    expect(service.filterBaselineServers(servers, "gc")).toEqual([servers[0]]);
  });

  it("sorts matched baseline servers by vcpus, memory, vendor, and api reference", () => {
    const servers: AdvisorBaselineServer[] = [
      {
        vendor_id: "gcp",
        api_reference: "sort-a",
        vcpus: 8,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-z",
        vcpus: 4,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-a",
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "azure",
        api_reference: "sort-b",
        vcpus: 4,
        memory_amount: 4096,
      },
    ];

    expect(service.filterBaselineServers(servers, "so")).toEqual([
      servers[2],
      servers[3],
      servers[1],
      servers[0],
    ]);
  });

  it("places matched baseline servers with missing numeric values last", () => {
    const servers: AdvisorBaselineServer[] = [
      {
        vendor_id: "aws",
        api_reference: "sort-complete",
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-missing-memory",
        vcpus: 4,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-missing-vcpu",
        memory_amount: 4096,
      },
    ];

    expect(service.filterBaselineServers(servers, "so")).toEqual([
      servers[0],
      servers[1],
      servers[2],
    ]);
  });

  it("builds average utilization summary context from baseline and target scores", () => {
    expect(service.buildUtilizationSummaryContext(100, 30)).toBe(
      "of 100; target score: 30",
    );
    expect(service.buildUtilizationSummaryContext(null, 30)).toBeNull();
  });

  it("aggregates baseline prices by region, currency, and allocation rule", () => {
    const prices: ServerPrice[] = [
      {
        vendor_id: "aws",
        region_id: "us-east-1",
        zone_id: "us-east-1a",
        server_id: "srv-1",
        operating_system: "Linux",
        allocation: Allocation.Ondemand,
        unit: PriceUnit.Hour,
        price: 0.12,
        currency: "USD",
      },
      {
        vendor_id: "aws",
        region_id: "eu-west-1",
        zone_id: "eu-west-1a",
        server_id: "srv-1",
        operating_system: "Linux",
        allocation: Allocation.Spot,
        unit: PriceUnit.Hour,
        price: 0.07,
        currency: "USD",
      },
      {
        vendor_id: "aws",
        region_id: "us-east-1",
        zone_id: "us-east-1a",
        server_id: "srv-1",
        operating_system: "Linux",
        allocation: Allocation.Ondemand,
        unit: PriceUnit.Month,
        price: 60,
        currency: "USD",
      },
      {
        vendor_id: "aws",
        region_id: "us-east-1",
        zone_id: "us-east-1a",
        server_id: "srv-1",
        operating_system: "Linux",
        allocation: Allocation.Ondemand,
        unit: PriceUnit.Hour,
        price: 0.2,
        currency: "EUR",
      },
    ];

    expect(
      service.buildBaselinePriceAggregate(prices, {
        bestPriceAllocation: "ANY",
        currency: "USD",
      }),
    ).toEqual({
      min_price: 0.07,
      min_price_spot: 0.07,
      min_price_ondemand: 0.12,
      min_price_ondemand_monthly: 60,
    });
    expect(
      service.buildBaselinePriceAggregate(prices, {
        bestPriceAllocation: "ONDEMAND_ONLY",
        currency: "USD",
        regionId: "us-east-1",
      }).min_price,
    ).toBe(0.12);
    expect(
      service.buildBaselinePriceAggregate(prices, {
        bestPriceAllocation: "MONTHLY",
        currency: "USD",
        regionId: "us-east-1",
      }).min_price,
    ).toBe(60);
  });

  it("builds benchmark and price deltas with the correct polarity", () => {
    expect(service.buildBenchmarkScoreDelta(120, 100)).toEqual({
      baselineValue: 100,
      candidateValue: 120,
      percentageDelta: 20,
      tone: "positive",
    });
    expect(service.buildBenchmarkScorePerPriceDelta(7.5, 100, 20)).toEqual({
      baselineValue: 5,
      candidateValue: 7.5,
      percentageDelta: 50,
      tone: "positive",
    });
    expect(service.buildPriceDelta(5, 10)).toEqual({
      baselineValue: 10,
      candidateValue: 5,
      percentageDelta: -50,
      tone: "positive",
    });
    expect(service.buildPriceDelta(null, 12)).toEqual({
      baselineValue: 12,
      candidateValue: null,
      percentageDelta: null,
      tone: "neutral",
    });
  });
});
