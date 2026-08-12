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
  });
});
