import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PLATFORM_ID } from "@angular/core";
import { SearchServersServersGetData } from "../../../../sdk/data-contracts";

import { LandingpageComponent } from "./landingpage.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("LandingpageComponent", () => {
  let component: LandingpageComponent;
  let fixture: ComponentFixture<LandingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: PLATFORM_ID,
          useValue: "server",
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render vendor, server, and region links for the settled front slot", async () => {
    component.hasRealValues = true;
    component.isSpinning = false;
    component.cpuCount = 8;
    component.ramCount = 32;
    component.spinnerContents[0][0] = {
      name: "AWS",
      logo: "/assets/images/vendors/aws.svg",
      vendorId: "aws",
    };
    component.spinnerContents[1][0] = {
      name: "m7g.large",
      architecture: "arm64",
      vendorId: "aws",
      apiReference: "m7g.large",
    };
    component.spinnerContents[2][0] = {
      name: "US East (N. Virginia)",
      city: "us-east-1a",
      vendorId: "aws",
      regionId: "us-east-1",
    };

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const vendorLink = host.querySelector(
      "#slot_vendor_link",
    ) as HTMLAnchorElement;
    const serverLink = host.querySelector(
      "#slot_server_link",
    ) as HTMLAnchorElement;
    const regionLink = host.querySelector(
      "#slot_region_link",
    ) as HTMLAnchorElement;

    expect(vendorLink)
      .withContext("Expected #slot_vendor_link to be rendered")
      .not.toBeNull();
    expect(serverLink)
      .withContext("Expected #slot_server_link to be rendered")
      .not.toBeNull();
    expect(regionLink)
      .withContext("Expected #slot_region_link to be rendered")
      .not.toBeNull();

    expect(vendorLink.getAttribute("href")).toContain("/servers?vendor=aws");
    expect(vendorLink.getAttribute("href")).toContain("vcpus_min=8");
    expect(vendorLink.getAttribute("href")).toContain("memory_min=32");
    expect(serverLink.getAttribute("href")).toContain("/server/aws/m7g.large");
    expect(regionLink.getAttribute("href")).toContain(
      "/servers?vendor_regions=aws~us-east-1",
    );
    expect(regionLink.getAttribute("href")).toContain("vcpus_min=8");
    expect(regionLink.getAttribute("href")).toContain("memory_min=32");
  });

  it("should normalize landing-page server listing query params", () => {
    component.cpuCount = 0;
    component.ramCount = 999;

    expect(
      component.getVendorQueryParams({ name: "AWS", vendorId: "aws" }),
    ).toEqual({
      vendor: "aws",
      vcpus_min: 2,
      memory_min: component.MAX_RAM_COUNT,
    });
  });

  it("should keep slot links inactive while spinning or off the front face", () => {
    component.isSpinning = true;
    component.hasRealValues = true;

    expect(component.isSlotLinkActive(0)).toBeFalse();

    component.isSpinning = false;

    expect(component.isSlotLinkActive(1)).toBeFalse();
    expect(component.isSlotLinkActive(0)).toBeTrue();
  });

  it("should prefer distinct vendors for spinner picks when available", () => {
    const spinnerPicker = component as unknown as {
      getTopSpinnerServers(
        servers: SearchServersServersGetData,
      ): SearchServersServersGetData;
    };
    const servers = [
      { vendor_id: "alicloud", server_id: "ecs.e-c1m2.large" },
      { vendor_id: "alicloud", server_id: "ecs.t6-c1m2.large" },
      { vendor_id: "alicloud", server_id: "ecs.t5-lc1m2.large" },
      { vendor_id: "azure", server_id: "Standard_F2ams_v6" },
      { vendor_id: "alicloud", server_id: "ecs.e-c1m4.large" },
      { vendor_id: "aws", server_id: "t4g.medium" },
      { vendor_id: "gcp", server_id: "334004" },
    ] as SearchServersServersGetData;

    const selectedServers = spinnerPicker.getTopSpinnerServers(servers);

    expect(selectedServers.map((server) => server.vendor_id)).toEqual([
      "alicloud",
      "azure",
      "aws",
    ]);
  });
});
