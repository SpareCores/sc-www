import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DownloadableLogoCollection } from "./downloadable-logo-collection";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DownloadableLogoCollection", () => {
  let component: DownloadableLogoCollection;
  let fixture: ComponentFixture<DownloadableLogoCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadableLogoCollection],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadableLogoCollection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
