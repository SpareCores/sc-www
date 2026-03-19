import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedCompareChartComponent } from "./embedded-compare-chart.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedCompareChartComponent", () => {
  let component: EmbeddedCompareChartComponent;
  let fixture: ComponentFixture<EmbeddedCompareChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedCompareChartComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedCompareChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
