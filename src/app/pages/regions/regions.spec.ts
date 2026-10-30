import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";

import { Regions as Regions } from "./regions";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPI } from "../../services/keeper-api";
import { TableRegionTableRegionGetData } from "../../../../sdk/data-contracts";

describe("Regions", () => {
  const keeperApiService = {
    getRegions: jasmine.createSpy("getRegions"),
    getVendors: jasmine.createSpy("getVendors"),
  };

  let component: Regions;
  let fixture: ComponentFixture<Regions>;
  let router: Router;

  beforeEach(async () => {
    keeperApiService.getRegions.and.resolveTo({ body: [] });
    keeperApiService.getVendors.and.resolveTo({ body: [] });

    await TestBed.configureTestingModule({
      imports: [Regions],
      providers: [
        ...sharedTestingProviders,
        {
          provide: PLATFORM_ID,
          useValue: "server",
        },
        {
          provide: KeeperAPI,
          useValue: keeperApiService,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, "navigate");

    fixture = TestBed.createComponent(Regions);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build vendor region filters for the servers page", () => {
    expect(
      component.getVendorRegionFilter({
        vendor_id: "aws",
        region_id: "us-east-1",
      } as TableRegionTableRegionGetData[number]),
    ).toBe("aws~us-east-1");
  });

  describe("vendor toggles", () => {
    const visibleRows = (): NodeListOf<HTMLTableRowElement> =>
      fixture.nativeElement.querySelectorAll(
        ".sc-table tbody tr:not(.regions-table__row--hidden)",
      );

    beforeEach(() => {
      component.regions = [
        { vendor_id: "aws", region_id: "us-east-1", country_id: "US" },
        { vendor_id: "gcp", region_id: "europe-west1", country_id: "BE" },
      ] as TableRegionTableRegionGetData;
      component.vendors = [
        { vendor_id: "aws", name: "AWS", selected: true },
        { vendor_id: "gcp", name: "GCP", selected: true },
      ];
      fixture.detectChanges();
    });

    it("should hide the regions of a hidden vendor", () => {
      component.vendors[0].selected = false;
      fixture.detectChanges();

      expect(component.visibleRegions.map((r) => r.vendor_id)).toEqual(["gcp"]);
      expect(visibleRows().length).toBe(1);
    });

    it("should keep regions of vendors without a toggle state", () => {
      component.vendors = [{ vendor_id: "aws", name: "AWS" }];
      fixture.detectChanges();

      expect(visibleRows().length).toBe(2);
    });

    it("should show the warning row when every vendor is hidden", () => {
      component.vendors.forEach((vendor) => (vendor.selected = false));
      fixture.detectChanges();

      expect(visibleRows().length).toBe(1);
      expect(visibleRows()[0].textContent).toContain("All vendors are hidden");
    });

    it("should expose each vendor toggle state with aria-pressed", () => {
      component.vendors[0].selected = false;
      fixture.detectChanges();

      const toggles: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll(".vendor_labels button");

      expect(
        Array.from(toggles).map((toggle) =>
          toggle.getAttribute("aria-pressed"),
        ),
      ).toEqual(["false", "true"]);
    });
  });

  it("should keep toggled vendors when the initial vendor request resolves late", async () => {
    let resolveVendors!: (response: { body: object[] }) => void;
    keeperApiService.getVendors.and.returnValue(
      new Promise((resolve) => (resolveVendors = resolve)),
    );

    const lateFixture = TestBed.createComponent(Regions);
    const lateComponent = lateFixture.componentInstance;
    lateComponent.vendors = [
      { vendor_id: "aws", name: "AWS", selected: false },
    ];

    resolveVendors({ body: [{ vendor_id: "aws", name: "AWS" }] });
    await lateFixture.whenStable();

    expect(lateComponent.isVendorHidden("aws")).toBeTrue();
  });

  it("should route region clicks to the servers page with vendor_regions", () => {
    component.openLink({ vendor_id: "aws", region_id: "us-east-1" });

    expect(router.navigate).toHaveBeenCalledWith(["/servers"], {
      queryParams: { vendor_regions: "aws~us-east-1" },
    });
  });
});
