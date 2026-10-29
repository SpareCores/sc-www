import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerAvailabilityCard } from "./server-availability-card";
import { PriceUnit } from "../../../../sdk/data-contracts";
import { AvailabilityRegion } from "../../services/server-spec-cards";

function buildRegions(count: number): AvailabilityRegion[] {
  return Array.from({ length: count }, (_, i) => ({
    vendor_id: "aws",
    region_id: `region-${i}`,
    display_name: `Region ${i}`,
    api_reference: `region-${i}`,
    inactive: false,
    spot: { price: 0, unit: PriceUnit.Hour, count: 0, currency: "USD" },
    ondemand: { price: 1, unit: PriceUnit.Hour, count: 1, currency: "USD" },
  }));
}

describe("ServerAvailabilityCard", () => {
  let component: ServerAvailabilityCard;
  let fixture: ComponentFixture<ServerAvailabilityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerAvailabilityCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerAvailabilityCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("regions", buildRegions(8));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll(".availability_line").length,
    ).toBe(8);
  });

  it("emits a toggle request from the show more button", () => {
    const toggleSpy = jasmine.createSpy("toggle");
    component.toggleRequested.subscribe(toggleSpy);

    fixture.nativeElement
      .querySelector("#availability_more_button button")
      .click();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it("hides the toggle when not expandable", () => {
    fixture.componentRef.setInput("expandable", false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("#availability_more"),
    ).toBeNull();
  });
});
