import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import {
  Allocation,
  DatabaseEngine,
  DatabaseHaLevel,
  DatabaseHaStrategy,
  PriceUnit,
  Status,
} from "../../../../sdk/data-contracts";
import { DatabaseDetails } from "./database-details";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DatabaseDetails", () => {
  let component: DatabaseDetails;
  let fixture: ComponentFixture<DatabaseDetails>;
  let keeperAPI: jasmine.SpyObj<KeeperAPIService>;

  beforeEach(async () => {
    keeperAPI = jasmine.createSpyObj<KeeperAPIService>("KeeperAPIService", [
      "getDatabase",
      "getDatabasePrices",
      "getVendors",
      "getRegions",
      "getDatabaseBenchmarks",
      "getServerBenchmarkMeta",
    ]);

    keeperAPI.getDatabase.and.resolveTo({
      body: {
        vendor_id: "aws",
        database_id: "db.m1.large",
        name: "db.m1.large",
        api_reference: "db.m1.large",
        display_name: "db.m1.large",
        description: "General purpose",
        vcpus: 2,
        memory_amount: 7680,
        engine: DatabaseEngine.Postgresql,
        engine_versions: ["15", "16"],
        ha: [DatabaseHaLevel.MultiZone],
        ha_strategy: [DatabaseHaStrategy.PassiveStandby],
        storage_size: 902,
        sla: 99.95,
        status: Status.Active,
      },
    });
    keeperAPI.getDatabasePrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          database_id: "db.m1.large",
          allocation: Allocation.Ondemand,
          ha: DatabaseHaLevel.None,
          ha_strategy: DatabaseHaStrategy.None,
          unit: PriceUnit.Hour,
          price: 0.2,
          currency: "USD",
        },
      ],
    });
    keeperAPI.getVendors.and.resolveTo({
      body: [{ vendor_id: "aws", name: "Amazon Web Services", logo: "" }],
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
    keeperAPI.getDatabaseBenchmarks.and.resolveTo({ body: [] });
    keeperAPI.getServerBenchmarkMeta.and.resolveTo({ body: [] });

    await TestBed.configureTestingModule({
      imports: [DatabaseDetails],
      providers: [
        ...sharedTestingProviders,
        { provide: KeeperAPIService, useValue: keeperAPI },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ vendor: "aws", id: "db.m1.large" }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("loads database details and builds availability rows", async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(keeperAPI.getDatabase).toHaveBeenCalledWith("aws", "db.m1.large");
    expect(component.databaseDetails?.display_name).toBe("db.m1.large");
    expect(component.availabilityRows.length).toBe(1);
    expect(component.availabilityRows[0].display_name).toBe("US East");
    expect(component.engineSections[0].properties.length).toBeGreaterThan(0);
    expect(component.pgbenchChart).toBeUndefined();
    expect(component.hasPgbenchHeaderScores).toBeFalse();
    expect(
      component.metadataSections[0].properties
        .find((property) => property.id === "name")
        ?.tooltips?.map((tooltip) => tooltip.content),
    ).toEqual([
      "Human-friendly name.",
      "Human-friendly reference (usually the id or name) of the resource.",
      "How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.",
      "Unique identifier, as called at the Vendor.",
    ]);
  });

  it("shows a performance chart when pgbench scores exist", async () => {
    keeperAPI.getDatabase.and.resolveTo({
      body: {
        vendor_id: "aws",
        database_id: "db.m1.large",
        name: "db.m1.large",
        api_reference: "db.m1.large",
        display_name: "db.m1.large",
        description: "General purpose",
        vcpus: 4,
        memory_amount: 7680,
        engine: DatabaseEngine.Postgresql,
        engine_versions: ["15", "16"],
        ha: [DatabaseHaLevel.MultiZone],
        ha_strategy: [DatabaseHaStrategy.PassiveStandby],
        storage_size: 902,
        sla: 99.95,
        status: Status.Active,
      },
    });
    keeperAPI.getDatabaseBenchmarks.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          benchmark_id: "pgbench:heavy_read_only",
          resource_type: "database",
          resource_id: "db.m1.large",
          score: 120,
          note: "peak nearby",
          config: { concurrency: 2 },
          environment: { latency_avg_ms: 4.5 },
        },
        {
          vendor_id: "aws",
          benchmark_id: "pgbench:heavy_read_only",
          resource_type: "database",
          resource_id: "db.m1.large",
          score: 200,
          config: { concurrency: 4 },
          environment: { latency_avg_ms: 8 },
        },
      ],
    });
    keeperAPI.getServerBenchmarkMeta.and.resolveTo({
      body: [
        {
          benchmark_id: "pgbench:heavy_read_only",
          name: "pgbench Heavy Read-Only",
          description: "Read-only pgbench throughput.",
          framework: "pgbench",
          unit: "tps",
        },
      ],
    });

    fixture = TestBed.createComponent(DatabaseDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.pgbenchChart).toBeTruthy();
    expect(component.pgbenchTitle).toBe("pgbench Heavy Read-Only");
    expect(component.pgbenchChart?.data.datasets[0].yAxisID).toBe("y");
    expect(component.pgbenchChart?.data.datasets[1].yAxisID).toBe("y1");
    expect(component.hasPgbenchHeaderScores).toBeFalse();
  });

  it("fills the header SCore when peak and single pgbench scores exist", async () => {
    keeperAPI.getDatabaseBenchmarks.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          benchmark_id: "pgbench:heavy_read_only:peak",
          resource_type: "database",
          resource_id: "db.m1.large",
          score: 8868.4,
        },
        {
          vendor_id: "aws",
          benchmark_id: "pgbench:heavy_read_only:single",
          resource_type: "database",
          resource_id: "db.m1.large",
          score: 2166.2,
        },
      ],
    });

    fixture = TestBed.createComponent(DatabaseDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.hasPgbenchHeaderScores).toBeTrue();
    expect(component.pgbenchPeakScore).toBe("8868");
    expect(component.pgbenchSingleScore).toBe("2166");
  });

  it("shows cheapest hour and month starts when both units are present", async () => {
    keeperAPI.getDatabasePrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          database_id: "db.m1.large",
          allocation: Allocation.Ondemand,
          ha: DatabaseHaLevel.None,
          ha_strategy: DatabaseHaStrategy.None,
          unit: PriceUnit.Month,
          price: 50,
          currency: "USD",
        },
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          database_id: "db.m1.large",
          allocation: Allocation.Ondemand,
          ha: DatabaseHaLevel.None,
          ha_strategy: DatabaseHaStrategy.None,
          unit: PriceUnit.Hour,
          price: 0.4,
          currency: "USD",
        },
        {
          vendor_id: "aws",
          region_id: "us-west-2",
          database_id: "db.m1.large",
          allocation: Allocation.Ondemand,
          ha: DatabaseHaLevel.None,
          ha_strategy: DatabaseHaStrategy.None,
          unit: PriceUnit.Hour,
          price: 0.2,
          currency: "USD",
        },
      ],
    });
    keeperAPI.getRegions.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          display_name: "US East",
          api_reference: "us-east-1",
        },
        {
          vendor_id: "aws",
          region_id: "us-west-2",
          display_name: "US West",
          api_reference: "us-west-2",
        },
      ],
    });

    fixture = TestBed.createComponent(DatabaseDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.databaseDetails?.prices?.length).toBe(3);
    expect(component.cardPriceDescription).toBe(
      " Pricing starts at 0.20 USD/hour and 50.00 USD/month.",
    );
  });
});
