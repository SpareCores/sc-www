import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedComparePreviewComponent } from "./embed-compare-preview.component";

describe("EmbedComparePreviewComponent", () => {
  let component: EmbedComparePreviewComponent;
  let fixture: ComponentFixture<EmbedComparePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedComparePreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedComparePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
