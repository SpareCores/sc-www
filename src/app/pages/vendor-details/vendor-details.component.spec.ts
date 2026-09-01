import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { VendorDetailsComponent } from "./vendor-details.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPIService } from "../../services/keeper-api.service";

describe("VendorDetailsComponent", () => {
  let component: VendorDetailsComponent;
  let fixture: ComponentFixture<VendorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDetailsComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ vendorId: "aws" }),
            snapshot: { params: { vendorId: "aws" } },
          },
        },
        {
          provide: KeeperAPIService,
          useValue: {
            getVendors: () =>
              Promise.resolve({
                body: [
                  {
                    vendor_id: "aws",
                    name: "Amazon Web Services",
                    logo: "/assets/images/vendors/aws.svg",
                    homepage: "https://aws.amazon.com/",
                    country_id: "US",
                    founding_year: 2006,
                    status: "active",
                  },
                ],
              }),
            getRegions: () =>
              Promise.resolve({
                body: [
                  {
                    vendor_id: "aws",
                    region_id: "us-east-1",
                    display_name: "US East",
                    country_id: "US",
                    lat: 1,
                    lon: 1,
                  },
                ],
              }),
            getZones: () =>
              Promise.resolve({
                body: [
                  {
                    vendor_id: "aws",
                    region_id: "us-east-1",
                    zone_id: "us-east-1a",
                  },
                ],
              }),
            getDebugInfo: () =>
              Promise.resolve({
                body: {
                  vendors: [
                    {
                      vendor_id: "aws",
                      all: 10,
                      active: 8,
                      evaluated: 5,
                      missing: 3,
                      inactive: 2,
                    },
                  ],
                },
              }),
            searchDatabases: () =>
              Promise.resolve({
                body: [],
                headers: { get: () => "4" },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build vendor breadcrumbs", async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.vendor?.vendor_id).toBe("aws");
    expect(component.breadcrumbs.map((segment) => segment.name)).toEqual([
      "Home",
      "Vendors",
      "Amazon Web Services",
    ]);
    expect(component.breadcrumbs[2].url).toBe("/vendors/aws");
    expect(component.regionCount).toBe(1);
    expect(component.zoneCount).toBe(1);
    expect(component.serverCount).toBe(10);
    expect(component.databaseCount).toBe(4);
  });
});
