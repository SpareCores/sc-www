import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerDetailsComponent } from "./server-details.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerDetailsComponent", () => {
  let component: ServerDetailsComponent;
  let fixture: ComponentFixture<ServerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerDetailsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("formats hw virt with icons and dashes like the tables", () => {
    component.serverDetails = {
      hw_virt: true,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("check");

    component.serverDetails = {
      hw_virt: false,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("x");

    component.serverDetails = {
      hw_virt: "none",
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("-");
  });

  it("keeps non hw virt booleans hidden", () => {
    component.serverDetails = {
      virtualization: true,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "virtualization" })).toBeUndefined();

    component.serverDetails = {
      virtualization: false,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "virtualization" })).toBeUndefined();
  });
});
