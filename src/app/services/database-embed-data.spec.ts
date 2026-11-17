import { TestBed } from "@angular/core/testing";

import { DatabaseEmbedData } from "./database-embed-data";
import { DATABASE_COMPARE_SPECS_WIDGET_ID } from "./database-embed.constants";
import { KeeperAPI } from "./keeper-api";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("DatabaseEmbedData", () => {
  const keeperAPI = {
    getDatabase: jasmine.createSpy("getDatabase"),
    getDatabasePrices: jasmine.createSpy("getDatabasePrices"),
    getDatabaseBenchmarks: jasmine.createSpy("getDatabaseBenchmarks"),
    getServerBenchmarkMeta: jasmine.createSpy("getServerBenchmarkMeta"),
    getVendors: jasmine.createSpy("getVendors"),
    getRegions: jasmine.createSpy("getRegions"),
    getServerV2: jasmine.createSpy("getServerV2"),
    getServerBenchmark: jasmine.createSpy("getServerBenchmark"),
  };

  let service: DatabaseEmbedData;

  beforeEach(() => {
    Object.values(keeperAPI).forEach((spy) => spy.calls.reset());
    keeperAPI.getServerBenchmarkMeta.and.resolveTo({ body: [] });
    keeperAPI.getVendors.and.resolveTo({
      body: [{ vendor_id: "aws", name: "AWS" }],
    });
    keeperAPI.getRegions.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          display_name: "US East",
          api_reference: "us-east-1",
        },
      ],
    });
    keeperAPI.getDatabasePrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          price: 0.2,
          currency: "USD",
          unit: "hour",
        },
      ],
    });
    keeperAPI.getDatabase.and.resolveTo({
      body: {
        vendor_id: "aws",
        database_id: "db.m5.large",
        name: "db.m5.large",
        api_reference: "db.m5.large",
        display_name: "db.m5.large",
        vcpus: 2,
      },
    });
    keeperAPI.getDatabaseBenchmarks.and.resolveTo({ body: [] });

    TestBed.configureTestingModule({
      providers: [
        ...sharedTestingProviders,
        { provide: KeeperAPI, useValue: keeperAPI },
      ],
    });
    service = TestBed.inject(DatabaseEmbedData);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("returns null when the database is missing", async () => {
    keeperAPI.getDatabase.and.resolveTo({ body: null });

    expect(await service.loadDetails("aws", "missing", "pgbench")).toBeNull();
  });

  it("loads prices only for the availability card", async () => {
    const details = await service.loadDetails(
      "aws",
      "db.m5.large",
      "availability",
    );

    expect(details?.path).toBe("/database/aws/db.m5.large");
    expect(details?.card?.cardTitle).toBe("Availability & Pricing");
    expect(details?.card?.sections[0].rows.map((row) => row.name)).toEqual([
      "US East",
    ]);
    expect(keeperAPI.getDatabaseBenchmarks).not.toHaveBeenCalled();
  });

  it("skips the underlying server without a server id", async () => {
    const details = await service.loadDetails(
      "aws",
      "db.m5.large",
      "underlying_server_pgbench",
    );

    expect(details?.pgbench).toBeDefined();
    expect(details?.pgbench?.chart).toBeUndefined();
    expect(keeperAPI.getServerV2).not.toHaveBeenCalled();
  });

  it("builds the compare specs without benchmark metadata", async () => {
    const details = await service.loadCompare(
      [{ vendor: "aws", database: "db.m5.large", display_name: "db.m5.large" }],
      DATABASE_COMPARE_SPECS_WIDGET_ID,
    );

    expect(details.propertySections.length).toBeGreaterThan(0);
    expect(details.priceRows.map((row) => row.id)).toContain("best_hour");
    expect(keeperAPI.getServerBenchmarkMeta).not.toHaveBeenCalled();
  });

  it("builds the compare chart servers without prices", async () => {
    const details = await service.loadCompare(
      [{ vendor: "aws", database: "db.m5.large", display_name: "db.m5.large" }],
      "pgbench",
    );

    expect(details.servers).toEqual([
      {
        display_name: "db.m5.large",
        vendor_id: "aws",
        vendor_name: "AWS",
        api_reference: "db.m5.large",
        benchmark_scores: [],
      },
    ]);
    expect(details.propertySections).toEqual([]);
    expect(details.priceRows).toEqual([]);
    expect(keeperAPI.getDatabasePrices).not.toHaveBeenCalled();
    expect(keeperAPI.getRegions).not.toHaveBeenCalled();
  });
});
