import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DownloadableLogoCollectionComponent } from "./downloadable-logo-collection.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DownloadableLogoCollectionComponent", () => {
  let component: DownloadableLogoCollectionComponent;
  let fixture: ComponentFixture<DownloadableLogoCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadableLogoCollectionComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadableLogoCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
