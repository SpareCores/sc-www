import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderDir } from "../../../../sdk/data-contracts";

import { TrafficPricesComponent } from "./traffic-prices.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TrafficPricesComponent", () => {
  let component: TrafficPricesComponent;
  let fixture: ComponentFixture<TrafficPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficPricesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TrafficPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("cycles vendor ordering through desc, asc, and cleared state", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: true,
        orderField: "vendor_id",
      }),
    );

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe("vendor_id");
    expect(component.orderDir).toBe(OrderDir.Desc);

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe("vendor_id");
    expect(component.orderDir).toBe(OrderDir.Asc);

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBeUndefined();
    expect(component.orderDir).toBeUndefined();
    expect(searchOptionsChangedSpy).toHaveBeenCalledTimes(3);
  });
});
