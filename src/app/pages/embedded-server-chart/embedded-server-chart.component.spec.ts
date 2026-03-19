import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedServerChartComponent } from "./embedded-server-chart.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedServerChartComponent", () => {
  let component: EmbeddedServerChartComponent;
  let fixture: ComponentFixture<EmbeddedServerChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedServerChartComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedServerChartComponent);
    component = fixture.componentInstance;
    component.showChart = "__test__";
    component.benchmarkMeta = [];
    component.benchmarksByCategory = [];
    component.serverDetails = {};
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
