import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedServerWidget } from "./embedded-server-widget";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedServerWidget", () => {
  let component: EmbeddedServerWidget;
  let fixture: ComponentFixture<EmbeddedServerWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedServerWidget],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedServerWidget);
    component = fixture.componentInstance;
    component.widgetId = "__test__";
    component.benchmarkMeta = [];
    component.benchmarksByCategory = [];
    component.serverDetails = {};
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the matching spec card for a spec card id", () => {
    component.widgetId = "metadata";
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
