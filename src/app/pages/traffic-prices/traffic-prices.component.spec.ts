import { ComponentFixture, TestBed } from "@angular/core/testing";

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

  it("does not allow ordering by vendor column", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: true,
        key: "vendor_id",
      }),
    );
    expect(vendorColumn?.orderField).toBeNull();

    const orderByBefore = component.orderBy;
    const orderDirBefore = component.orderDir;
    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe(orderByBefore);
    expect(component.orderDir).toBe(orderDirBefore);
    expect(searchOptionsChangedSpy).not.toHaveBeenCalled();
  });
});
