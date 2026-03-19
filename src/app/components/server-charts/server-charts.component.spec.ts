import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerChartsComponent } from "./server-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerChartsComponent", () => {
  let component: ServerChartsComponent;
  let fixture: ComponentFixture<ServerChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerChartsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerChartsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("showChart", "__test__");
    fixture.componentRef.setInput("benchmarkMeta", []);
    fixture.componentRef.setInput("benchmarksByCategory", []);
    fixture.componentRef.setInput("serverDetails", {});
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
