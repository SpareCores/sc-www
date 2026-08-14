import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerChartsComponent } from "./server-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { Status } from "../../../../sdk/data-contracts";

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
        status: Status.Active,
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

    expect(root.querySelector("sc-workload-profile-panel")).toBeTruthy();
    expect(root.textContent).toContain("Web server");
  });

  it("hides the workload profile panel when no workload benchmarks exist", () => {
    fixture.componentRef.setInput("showChart", "workload_profile");
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        "sc-workload-profile-panel",
      ),
    ).toBeNull();
  });

  it("hides the workload profile panel when only unrelated scores exist", () => {
    fixture.componentRef.setInput("showChart", "workload_profile");
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "stress_ng:div16",
          score: 100,
        },
      ],
    });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        "sc-workload-profile-panel",
      ),
    ).toBeNull();
  });

  it("renders the pgbench chart when pgbench scores exist", () => {
    fixture.componentRef.setInput("showChart", "pgbench");
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "pgbench:heavy_read_only",
        name: "pgbench Heavy Read-Only",
        description: "Read-only pgbench throughput.",
        unit: "Transactions per minute (TPM)",
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("benchmarksByCategory", [
      {
        benchmark_id: "pgbench:heavy_read_only",
        benchmarks: [
          {
            vendor_id: "aws",
            server_id: "m7g.large",
            benchmark_id: "pgbench:heavy_read_only",
            config: { concurrency: 2 },
            score: 120,
            environment: { latency_avg_ms: 4.5 },
          },
        ],
      },
    ]);
    fixture.componentRef.setInput("serverDetails", {
      display_name: "Server A",
      vcpus: 4,
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector("sc-benchmark-line-chart")).toBeTruthy();
    expect(root.textContent).toContain("pgbench Heavy Read-Only");
  });

  it("hides the pgbench chart when no pgbench scores exist", () => {
    fixture.componentRef.setInput("showChart", "pgbench");
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector("#pgbench_chart"),
    ).toBeNull();
  });
});
