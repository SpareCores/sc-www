import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedComparePreviewComponent } from "./embed-compare-preview.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbedComparePreviewComponent", () => {
  let component: EmbedComparePreviewComponent;
  let fixture: ComponentFixture<EmbedComparePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedComparePreviewComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedComparePreviewComponent);
    component = fixture.componentInstance;
    component.instances = "server-a,server-b";
    component.chartname = "score";
    component.isModal = false;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
