import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { WorkloadProfilePanelComponent } from "./workload-profile-panel.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  BenchmarkComponentAggregationMethod,
  BenchmarkComponentNormalizationMethod,
  Status,
} from "../../../../../sdk/data-contracts";

describe("WorkloadProfilePanelComponent", () => {
  let fixture: ComponentFixture<WorkloadProfilePanelComponent>;

  const webBreakdown = {
    aggregation: BenchmarkComponentAggregationMethod.WeightedGeometricMean,
    normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
    coverage: 1,
    components: [
      {
        label: "Static web RPS (1 KiB, 8 conn/vCPU)",
        weight: 0.3,
        weight_share: 0.3,
        raw: 964472,
        reference: 926482,
        normalized: 1.04,
        impact: 1.18,
        note: null,
      },
      {
        label: "LLM text generation (Llama-3.3 70B, 128 tok)",
        weight: 0.15,
        weight_share: 0.15,
        raw: null,
        reference: 3.624374,
        normalized: 0.01,
        impact: -49.9,
        note: "penalized: no usable measurement",
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkloadProfilePanelComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkloadProfilePanelComponent);
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        status: Status.Active,
        source: {
          kind: "compound",
          aggregation:
            BenchmarkComponentAggregationMethod.WeightedGeometricMean,
          normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
          impact_formula: "Impact formula text",
          components: [
            {
              benchmark_id: "static_web:rps-extrapolated",
              label: "Static web RPS (1 KiB, 8 conn/vCPU)",
              weight: 0.3,
            },
            {
              benchmark_id: "llm_speed:text_generation",
              label: "LLM text generation (Llama-3.3 70B, 128 tok)",
              weight: 0.15,
            },
          ],
        },
      },
      {
        benchmark_id: "static_web:rps-extrapolated",
        name: "Static web server (extrapolated) speed",
        description: "Static web speed description",
        unit: "Requests per second (rps)",
        status: Status.Active,
      },
      {
        benchmark_id: "llm_speed:text_generation",
        name: "LLM inference speed for text generation",
        description: "LLM generation description",
        unit: "tokens/second (t/s)",
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("servers", [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            benchmark_id: "workload_profile:web",
            score: 0.832,
          },
        ],
      },
    ]);
    fixture.detectChanges();
  });

  it("renders the workload profile panel", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 120,
        },
      ],
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Web server",
    );
  });

  it("hides the workload profile panel when its score is null", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: null,
        },
      ],
    });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        ".workload-profile-charts-to-hide-for-test",
      ),
    ).toBeNull();
  });

  it("includes the selected benchmark score note", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 120,
          note: "Partial coverage: missing component benchmark(s)",
        },
      ],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedProfileItem()?.note).toBe(
      "Partial coverage: missing component benchmark(s)",
    );
  });

  it("exposes benchmark metadata notes for the workload profile header", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        note: "Partial coverage on some instance types.",
        status: Status.Active,
      },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.workloadProfileMetaNote()).toBe(
      "- Web server: Partial coverage on some instance types.",
    );
  });

  it("selects the first workload profile by default on details layout", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 0.832,
          score_breakdown: webBreakdown,
        },
      ],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedProfileId()).toBe(
      "workload_profile:web",
    );
    expect(fixture.componentInstance.selectedProfileItem()?.title).toBe(
      "Web server",
    );
  });

  it("changes the selected profile", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        status: Status.Active,
        source: {
          kind: "compound",
          aggregation:
            BenchmarkComponentAggregationMethod.WeightedGeometricMean,
          normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
          components: [],
        },
      },
      {
        benchmark_id: "workload_profile:cache",
        name: "Workload profile: Cache Intensive",
        description: "Cache intensive workload profile",
        status: Status.Active,
        source: {
          kind: "compound",
          aggregation:
            BenchmarkComponentAggregationMethod.WeightedGeometricMean,
          normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
          components: [],
        },
      },
    ]);
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 0.832,
          score_breakdown: webBreakdown,
        },
        {
          benchmark_id: "workload_profile:cache",
          score: 0.917,
          score_breakdown: webBreakdown,
        },
      ],
    });
    fixture.detectChanges();

    fixture.componentInstance.onProfileSelected("workload_profile:cache");
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedProfileId()).toBe(
      "workload_profile:cache",
    );
    expect(fixture.componentInstance.selectedProfileItem()?.title).toBe(
      "Cache Intensive",
    );
  });

  it("renders compact units and the breakdown table on details layout", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 0.832,
          score_breakdown: webBreakdown,
        },
      ],
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain("rps");
    expect(root.textContent).not.toContain("Requests per second (rps)");
    expect(root.textContent).not.toContain("(rps)");
    expect(root.querySelectorAll("th").length).toBe(9);
    const warningIcon = fixture.debugElement.query(
      By.css("td .benchmark-note-icon"),
    );
    expect(warningIcon).toBeTruthy();
    warningIcon.triggerEventHandler("mouseenter", new MouseEvent("mouseenter"));
    fixture.detectChanges();
    expect(fixture.componentInstance.tooltipContent).toBe(
      "penalized: no usable measurement",
    );
    expect(
      root.querySelector(
        ".workload-profile-breakdown-table__impact-value.text-emerald-400",
      )?.textContent,
    ).toContain("+1.18%");
    expect(
      root.querySelector(
        ".workload-profile-breakdown-table__impact-value.text-red-400",
      )?.textContent,
    ).toContain("-49.90%");
  });

  it("hides workload profiles without score data from the dropdown", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        status: Status.Active,
        source: {
          kind: "compound",
          aggregation:
            BenchmarkComponentAggregationMethod.WeightedGeometricMean,
          normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
          components: [],
        },
      },
      {
        benchmark_id: "workload_profile:llm",
        name: "Workload profile: LLM Inference",
        description: "LLM inference workload profile",
        status: Status.Active,
        source: {
          kind: "compound",
          aggregation:
            BenchmarkComponentAggregationMethod.WeightedGeometricMean,
          normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
          components: [],
        },
      },
    ]);
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 0.832,
          score_breakdown: webBreakdown,
        },
      ],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.profileDropdownItems()).toEqual([
      { id: "workload_profile:web", title: "Web server" },
    ]);
    expect(fixture.componentInstance.selectedProfileId()).toBe(
      "workload_profile:web",
    );
  });

  it("clamps gauge values above 2.0 while displaying the actual score", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 18.677,
          score_breakdown: webBreakdown,
        },
      ],
    });
    fixture.detectChanges();

    const gauge = fixture.componentInstance.scoreGaugeChart();

    expect(gauge.displayValue).toBe("18.677");
    expect(gauge.data.datasets[0]?.data).toEqual([2, 0]);
  });
});
