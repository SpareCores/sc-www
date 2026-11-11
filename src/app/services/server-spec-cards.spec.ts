import { TestBed } from "@angular/core/testing";

import { ServerSpecCards } from "./server-spec-cards";
import { PriceUnit, Status } from "../../../sdk/data-contracts";
import type { ExtendedServerPrice } from "../pages/server-details/server-details.types";

describe("ServerSpecCards", () => {
  let service: ServerSpecCards;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerSpecCards);
  });

  it("formats hw virt with icons and dashes like the tables", () => {
    expect(service.getProperty({ hw_virt: true }, { id: "hw_virt" })).toBe(
      "check",
    );
    expect(service.getProperty({ hw_virt: false }, { id: "hw_virt" })).toBe(
      "x",
    );
    expect(service.getProperty({ hw_virt: "none" }, { id: "hw_virt" })).toBe(
      "-",
    );
  });

  it("keeps non hw virt booleans hidden", () => {
    expect(
      service.getProperty({ virtualization: true }, { id: "virtualization" }),
    ).toBeUndefined();
    expect(
      service.getProperty({ virtualization: false }, { id: "virtualization" }),
    ).toBeUndefined();
  });

  it("averages prices per region and sorts by ondemand price", () => {
    const price = (
      region_id: string,
      allocation: "spot" | "ondemand",
      value: number,
    ) =>
      ({
        vendor_id: "aws",
        region_id,
        zone_id: `${region_id}a`,
        server_id: "m5.large",
        operating_system: "linux",
        allocation,
        unit: PriceUnit.Hour,
        price: value,
        currency: "USD",
        status: Status.Active,
        region: { display_name: region_id, api_reference: region_id },
        zone: { display_name: `${region_id}a` },
      }) as ExtendedServerPrice;

    const regions = service.buildAvailabilityRegions([
      price("eu", "ondemand", 2),
      price("eu", "ondemand", 4),
      price("us", "ondemand", 1),
      price("us", "spot", 0.5),
    ]);

    expect(regions.map((region) => region.region_id)).toEqual(["us", "eu"]);
    expect(regions[1].ondemand.price).toBe(3);
    expect(regions[0].spot.price).toBe(0.5);
  });

  it("builds availability rows with formatted prices and inactive notes", () => {
    const [section] = service.buildAvailabilitySections([
      {
        vendor_id: "aws",
        region_id: "us",
        display_name: "US East",
        api_reference: "us-east-1",
        inactive: true,
        spot: { price: 0, unit: PriceUnit.Hour, count: 0, currency: "USD" },
        ondemand: { price: 1, unit: PriceUnit.Hour, count: 1, currency: "USD" },
      },
    ]);

    expect(section.columns).toEqual(["Region / ID", "Spot", "Ondemand"]);
    expect(section.rows[0].values).toEqual(["-", "1 USD/h"]);
    expect(section.rows[0].warning).toContain("not currently orderable");
  });
});
