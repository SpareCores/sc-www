import { TestBed } from "@angular/core/testing";

import { ServerSpecCards } from "./server-spec-cards";
import { PriceUnit, Status } from "../../../sdk/data-contracts";
import type { ExtendedServerPrice } from "../pages/server-details/server-details";

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
});
