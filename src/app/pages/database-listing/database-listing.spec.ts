import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { Router } from "@angular/router";
import { OrderDir } from "../../../../sdk/data-contracts";

import { DatabaseListing } from "./database-listing";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DatabaseListing", () => {
  let component: DatabaseListing;
  let fixture: ComponentFixture<DatabaseListing>;
  let router: Router;
  let keeperAPI: KeeperAPIService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseListing],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseListing);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    keeperAPI = TestBed.inject(KeeperAPIService);
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

  it("shows benchmark columns by default and hides engine versions and ha", () => {
    const shown = component.possibleColumns
      .filter((column) => column.show)
      .map((column) => column.name);

    expect(shown).toContain("BENCHMARK");
    expect(shown).toContain("$ EFFICIENCY");
    expect(shown).not.toContain("ENGINE VERSIONS");
    expect(shown).not.toContain("HA");
    expect(shown).not.toContain("HA STRATEGY");
  });

  it("formats benchmark scores", () => {
    expect(component.getScore(null)).toBe("-");
    expect(component.getScore(0.12)).toBe("0.1");
    expect(component.getScore(12.34)).toBe("12.34");
    expect(component.getScore(120.9)).toBe("121");
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

  it("keeps filter query params when merging a column update via Router", () => {
    const navigateSpy = spyOn(router, "navigate").and.resolveTo(true);
    const pushStateSpy = spyOn(history, "pushState");

    component.searchOptionsChanged({ vcpus_min: 8 });

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ vcpus_min: 8 }),
        replaceUrl: false,
      }),
    );

    navigateSpy.calls.reset();
    component.query = { vcpus_min: 8 };
    component.refreshColumns(true);

    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ columns: jasmine.any(Number) }),
        queryParamsHandling: "merge",
        replaceUrl: true,
      }),
    );
  });

  it("ignores stale search responses", fakeAsync(() => {
    let resolveFirst!: (value: any) => void;
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "searchDatabases").and.returnValues(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );

    component.query = {};
    (component as any)._searchDatabases(true);
    component.query = { vcpus_min: 8 };
    (component as any)._searchDatabases(true);

    resolveSecond({
      body: [{ api_reference: "filtered" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.databases).toEqual([
      jasmine.objectContaining({ api_reference: "filtered" }),
    ]);

    resolveFirst({
      body: [{ api_reference: "default" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.databases).toEqual([
      jasmine.objectContaining({ api_reference: "filtered" }),
    ]);
  }));
});
