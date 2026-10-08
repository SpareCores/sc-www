import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { VendorDetailsComponent } from "./vendor-details.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { VENDOR_DETAILS_ERROR_TOAST_ID } from "../../services/toast-ids";

describe("VendorDetailsComponent", () => {
  let component: VendorDetailsComponent;
  let fixture: ComponentFixture<VendorDetailsComponent>;
  const getVendors = jasmine.createSpy("getVendors");

  beforeEach(async () => {
    getVendors.calls.reset();
    getVendors.and.resolveTo({
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
        {
          vendor_id: "gcp",
          name: "Google Cloud",
          logo: "/assets/images/vendors/gcp.svg",
          homepage: "https://cloud.google.com/",
          country_id: "US",
          founding_year: 2008,
          status: "active",
        },
      ],
    });

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
            getVendors,
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
                  {
                    vendor_id: "gcp",
                    region_id: "us-central1",
                    display_name: "US Central",
                    country_id: "US",
                    lat: 2,
                    lon: 2,
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
                  {
                    vendor_id: "gcp",
                    region_id: "us-central1",
                    zone_id: "us-central1-a",
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
                    {
                      vendor_id: "gcp",
                      all: 7,
                      active: 6,
                      evaluated: 4,
                      missing: 1,
                      inactive: 1,
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

  it("shows http error toast when vendor load fails with 500", async () => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    getVendors.and.rejectWith({ status: 500 });

    fixture = TestBed.createComponent(VendorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      { status: 500 },
      jasmine.objectContaining({ id: VENDOR_DETAILS_ERROR_TOAST_ID }),
    );
  });

  it("ignores stale vendor success after a newer vendor load", fakeAsync(() => {
    let resolveFirst!: (value: any) => void;
    getVendors.and.returnValues(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
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
          {
            vendor_id: "gcp",
            name: "Google Cloud",
            logo: "/assets/images/vendors/gcp.svg",
            homepage: "https://cloud.google.com/",
            country_id: "US",
            founding_year: 2008,
            status: "active",
          },
        ],
      }),
    );

    (component as any).loadVendor("aws");
    (component as any).loadVendor("gcp");
    tick();
    fixture.detectChanges();

    expect(component.vendor?.vendor_id).toBe("gcp");
    expect(component.isLoading).toBeFalse();

    resolveFirst({
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
    });
    tick();
    fixture.detectChanges();

    expect(component.vendor?.vendor_id).toBe("gcp");
    expect(component.isLoading).toBeFalse();
  }));

  it("ignores stale vendor failure after a newer vendor load", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    let rejectFirst!: (reason?: any) => void;

    getVendors.and.returnValues(
      new Promise((_resolve, reject) => {
        rejectFirst = reject;
      }),
      Promise.resolve({
        body: [
          {
            vendor_id: "gcp",
            name: "Google Cloud",
            logo: "/assets/images/vendors/gcp.svg",
            homepage: "https://cloud.google.com/",
            country_id: "US",
            founding_year: 2008,
            status: "active",
          },
        ],
      }),
    );

    (component as any).loadVendor("aws");
    (component as any).loadVendor("gcp");
    tick();
    fixture.detectChanges();

    const loadedVendor = component.vendor?.vendor_id;
    const errorBefore = component.keeperResponseErrorMsg;
    showHttpError.calls.reset();

    rejectFirst({ status: 500 });
    tick();
    fixture.detectChanges();

    expect(component.vendor?.vendor_id).toBe(loadedVendor);
    expect(component.keeperResponseErrorMsg).toBe(errorBefore);
    expect(component.isLoading).toBeFalse();
    expect(showHttpError).not.toHaveBeenCalled();
  }));
});
