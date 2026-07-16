import {
  BenchmarkComponentAggregationMethod,
  BenchmarkComponentNormalizationMethod,
} from "../../../../../sdk/data-contracts";
import {
  buildWorkloadProfileBreakdownTable,
  compactBreakdownUnit,
  formatBreakdownNumericValue,
  formatBreakdownPercent,
  formatImpactPercent,
  getImpactColorClass,
  isCompoundSource,
} from "./workload-profile-breakdown.utils";

describe("workload-profile-breakdown.utils", () => {
  it("detects compound benchmark sources", () => {
    expect(
      isCompoundSource({
        kind: "compound",
        aggregation: BenchmarkComponentAggregationMethod.WeightedGeometricMean,
        normalization: BenchmarkComponentNormalizationMethod.MedianRatio,
        components: [],
      }),
    ).toBeTrue();
    expect(isCompoundSource({ kind: "measured" })).toBeFalse();
  });

  it("builds breakdown rows with resolved component metadata", () => {
    const table = buildWorkloadProfileBreakdownTable({
      profile: {
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
          ],
        },
      },
      benchmarkMeta: [
        {
          benchmark_id: "static_web:rps-extrapolated",
          name: "Static web server (extrapolated) speed",
          description: "Static web speed description",
          note: "Static web scaling caveat",
          unit: "Requests per second (rps)",
        },
      ],
      scoreBreakdown: {
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
        ],
      },
    });

    expect(table?.impactFormula).toBe("Impact formula text");
    expect(table?.rows[0]?.componentDescription).toBe(
      "Static web speed description",
    );
    expect(table?.rows[0]?.unit).toBe("Requests per second (rps)");
    expect(table?.rows[0]?.metaNote).toBe("Static web scaling caveat");
  });

  it("returns undefined when breakdown components are missing", () => {
    expect(
      buildWorkloadProfileBreakdownTable({
        profile: {},
        benchmarkMeta: [],
        scoreBreakdown: null,
      }),
    ).toBeUndefined();
  });

  it("formats values, weights, and impact", () => {
    expect(formatBreakdownNumericValue(null)).toBe("—");
    expect(compactBreakdownUnit("Operations per second (ops/sec)")).toBe(
      "ops/sec",
    );
    expect(compactBreakdownUnit("Megabytes per second (MB/sec)")).toBe(
      "MB/sec",
    );
    expect(formatBreakdownNumericValue(964472)).toBe("964,472");
    expect(formatBreakdownPercent(0.15)).toBe("15.00%");
    expect(formatImpactPercent(-3.11)).toBe("-3.11%");
    expect(formatImpactPercent(1.18)).toBe("+1.18%");
    expect(getImpactColorClass(1.18)).toBe("text-emerald-400");
    expect(getImpactColorClass(-3.11)).toBe("text-red-400");
    expect(getImpactColorClass(0)).toBe("");
  });
});
