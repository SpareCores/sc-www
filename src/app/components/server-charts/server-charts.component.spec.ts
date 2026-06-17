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

  it("renders the workload profile panel when workload benchmarks exist", () => {
    fixture.componentRef.setInput("showChart", "workload_profile");
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
      },
    ]);
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 100,
        },
      ],
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector("app-workload-profile-panel")).toBeTruthy();
    expect(root.textContent).toContain("Workload profile: Web server");
  });

  it("hides the workload profile panel when no workload benchmarks exist", () => {
    fixture.componentRef.setInput("showChart", "workload_profile");
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        "app-workload-profile-panel",
      ),
    ).toBeNull();
  });
});
