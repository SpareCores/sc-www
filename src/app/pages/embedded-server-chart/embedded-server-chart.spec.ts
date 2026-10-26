import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedServerChart } from "./embedded-server-chart";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedServerChart", () => {
  let component: EmbeddedServerChart;
  let fixture: ComponentFixture<EmbeddedServerChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedServerChart],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedServerChart);
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
