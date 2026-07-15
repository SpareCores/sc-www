import {
  Benchmark,
  CompoundSource,
  ScoreComponent,
  WorkloadScoreBreakdown,
} from "../../../../../sdk/data-contracts";

export type WorkloadProfileBreakdownRow = ScoreComponent & {
  componentDescription?: string;
  unit?: string | null;
  benchmarkNote?: string;
};

export type WorkloadProfileBreakdownTable = {
  impactFormula?: string | null;
  hasNotes: boolean;
  rows: WorkloadProfileBreakdownRow[];
};

export function isCompoundSource(
  source: Benchmark["source"],
): source is CompoundSource {
  return !!source && "components" in source && Array.isArray(source.components);
}

export function buildWorkloadProfileBreakdownTable(params: {
  profile: Pick<Benchmark, "source">;
  benchmarkMeta: Array<
    Pick<Benchmark, "benchmark_id" | "unit"> &
      Partial<Pick<Benchmark, "description" | "note">>
  >;
  scoreBreakdown?: WorkloadScoreBreakdown | null;
}): WorkloadProfileBreakdownTable | undefined {
  const { profile, benchmarkMeta, scoreBreakdown } = params;

  if (!scoreBreakdown?.components?.length) {
    return undefined;
  }

  const compound = isCompoundSource(profile.source)
    ? profile.source
    : undefined;
  const entryByLabel = new Map(
    compound?.components.map((entry) => [entry.label, entry]),
  );
  const metaById = new Map(
    benchmarkMeta.map((benchmark) => [benchmark.benchmark_id, benchmark]),
  );

  const rows: WorkloadProfileBreakdownRow[] = scoreBreakdown.components.map(
    (component) => {
      const entry = entryByLabel.get(component.label);
      const componentMeta = entry
        ? metaById.get(entry.benchmark_id)
        : undefined;

      return {
        ...component,
        componentDescription: componentMeta?.description ?? undefined,
        unit: componentMeta?.unit ?? undefined,
        benchmarkNote: componentMeta?.note?.trim() || undefined,
      };
    },
  );

  return {
    impactFormula: compound?.impact_formula,
    hasNotes: rows.some((row) => !!row.note?.trim()),
    rows,
  };
}

export function compactBreakdownUnit(unit?: string | null): string | undefined {
  const trimmedUnit = unit?.trim();

  if (!trimmedUnit) {
    return undefined;
  }

  const match = trimmedUnit.match(/\(([^)]+)\)\s*$/);

  return match ? match[1] : trimmedUnit;
}

export function formatBreakdownNumericValue(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return formatBreakdownNumber(value);
}

export function formatBreakdownPercent(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${(value * 100).toFixed(2)}%`;
}

export function formatImpactPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function getImpactColorClass(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) {
    return "";
  }

  return value > 0 ? "text-emerald-400" : "text-red-400";
}

function formatBreakdownNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  if (Math.abs(value) >= 1) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  }

  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
