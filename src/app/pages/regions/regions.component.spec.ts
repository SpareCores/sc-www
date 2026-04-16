import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";

import { RegionsComponent as RegionsComponent } from "./regions.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPIService } from "../../services/keeper-api.service";

describe("RegionsComponent", () => {
  const keeperApiService = {
    getRegions: jasmine.createSpy("getRegions"),
    getVendors: jasmine.createSpy("getVendors"),
  };

  let component: RegionsComponent;
  let fixture: ComponentFixture<RegionsComponent>;
  let router: Router;

  beforeEach(async () => {
    keeperApiService.getRegions.and.resolveTo({ body: [] });
    keeperApiService.getVendors.and.resolveTo({ body: [] });

    await TestBed.configureTestingModule({
      imports: [RegionsComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: PLATFORM_ID,
          useValue: "server",
        },
        {
          provide: KeeperAPIService,
          useValue: keeperApiService,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, "navigate");

    fixture = TestBed.createComponent(RegionsComponent);
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
      } as any),
    ).toBe("aws~us-east-1");
  });

  it("should route region clicks to the servers page with vendor_regions", () => {
    component.openLink({ vendor_id: "aws", region_id: "us-east-1" });

    expect(router.navigate).toHaveBeenCalledWith(["/servers"], {
      queryParams: { vendor_regions: "aws~us-east-1" },
    });
  });
});
