import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareChartsComponent } from "./server-compare-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerCompareChartsComponent", () => {
  let component: ServerCompareChartsComponent;
  let fixture: ComponentFixture<ServerCompareChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareChartsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareChartsComponent);
    component = fixture.componentInstance;
    component.showChart = "__test__";
    component.benchmarkMeta = [];
    component.benchmarkCategories = [];
    component.instanceProperties = [];
    component.instancePropertyCategories = [];
    component.servers = [];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
