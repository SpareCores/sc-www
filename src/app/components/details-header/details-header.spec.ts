import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DetailsHeader } from "./details-header";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { ShareLink } from "../../services/share-link";

describe("DetailsHeader", () => {
  let fixture: ComponentFixture<DetailsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsHeader],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsHeader);
    fixture.componentRef.setInput("resource", "database");
    fixture.componentRef.setInput("vendorId", "aws");
    fixture.componentRef.setInput("vendorName", "AWS");
    fixture.componentRef.setInput("entityId", "db.m5.large");
    fixture.componentRef.setInput("displayName", "db.m5.large");
    fixture.componentRef.setInput("features", [{ name: "vCPUs", value: "2" }]);
    fixture.detectChanges();
  });

  it("should create with the resource info box id", () => {
    expect(
      fixture.nativeElement.querySelector("#database_base_info_box"),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("vCPUs");
  });

  it("shows the score panel only with a score", () => {
    expect(fixture.nativeElement.textContent).not.toContain("Peak TPM");

    fixture.componentRef.setInput("score", {
      primary: "8,324",
      primaryLabel: "Peak TPM",
      secondary: "171",
      secondaryLabel: "Single-client baseline",
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Peak TPM");
  });

  it("copies the current url from the share button", () => {
    const copy = spyOn(
      TestBed.inject(ShareLink),
      "copyCurrentUrl",
    ).and.resolveTo(true);
    const shareButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Share"));

    shareButton?.click();

    expect(copy).toHaveBeenCalled();
  });
});
