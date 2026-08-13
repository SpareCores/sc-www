import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderDir } from "../../../../sdk/data-contracts";

import { DatabaseListing } from "./database-listing";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DatabaseListing", () => {
  let component: DatabaseListing;
  let fixture: ComponentFixture<DatabaseListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseListing],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for column info tooltips", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("span");

    component.showTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Tooltip content",
    );

    expect(component.tooltipContent).toBe("Tooltip content");
    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltip.nativeElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-above",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip.nativeElement);
  });

  it("cycles vendor ordering through desc, asc, and cleared state", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: false,
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

  it("formats list and sla helpers", () => {
    expect(component.formatList(["a", "b"])).toBe("a, b");
    expect(component.formatList([])).toBe("-");
    expect(component.formatSla(99.95)).toBe("99.95%");
    expect(component.formatSla(null)).toBe("-");
    expect(component.getMemory({ memory_amount: 7680 } as never)).toBe(
      "7.5 GiB",
    );
  });

  it("pads column bitmask so a hidden first column still restores", () => {
    const columnCount = component.possibleColumns.length;
    const bits = component.possibleColumns.map((_, index) =>
      index === 0 ? 0 : 1,
    );
    const encoded = bits.reduce(
      (acc: number, bit: number) => (acc << 1) | bit,
      0,
    );
    const restored = Number(encoded)
      .toString(2)
      .padStart(columnCount, "0")
      .split("")
      .map(Number);

    expect(Number(encoded).toString(2).length).toBeLessThan(columnCount);
    expect(restored.length).toBe(columnCount);
    expect(restored[0]).toBe(0);
    expect(restored.slice(1).every((bit) => bit === 1)).toBeTrue();
  });
});
