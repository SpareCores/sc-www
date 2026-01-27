import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedCompareChartComponent } from "./embedded-compare-chart.component";

describe("EmbeddedCompareChartComponent", () => {
  let component: EmbeddedCompareChartComponent;
  let fixture: ComponentFixture<EmbeddedCompareChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedCompareChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedCompareChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
