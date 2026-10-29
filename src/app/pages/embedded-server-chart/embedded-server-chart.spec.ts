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

  it("renders the matching spec card for a spec card id", () => {
    component.showChart = "metadata";
    component.serverDetails = { vendor_id: "aws", api_reference: "m5.large" };
    component.metadataSections = [
      {
        name: "Server Metadata",
        properties: [{ id: "name", name: "Name", value: "m5.large" }],
      },
    ];
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector("#details")).not.toBeNull();
    expect(element.querySelector("#details_more_button")).toBeNull();
    expect(element.querySelector("sc-server-charts")).toBeNull();
  });
});
