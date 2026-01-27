import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DownloadableLogoCollectionComponent } from "./downloadable-logo-collection.component";

describe("DownloadableLogoCollectionComponent", () => {
  let component: DownloadableLogoCollectionComponent;
  let fixture: ComponentFixture<DownloadableLogoCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadableLogoCollectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadableLogoCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
