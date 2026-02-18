import {
  BenchmarkFamilyFilterValue,
  ServerAssessment,
  ServerStatusFilter,
} from "./benchmark-coverage.types";

export function safeJsonParse(
  params: Record<string, string>,
  key: string,
): unknown {
  try {
    return params[key] ? JSON.parse(params[key]) : null;
  } catch (error) {
    console.warn(`Invalid format for ${key} in URL`, error);
    return null;
  }
}

export function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export function parseServerStatusFilter(value: unknown): ServerStatusFilter {
  if (
    typeof value === "string" &&
    ["all", "active", "inactive"].includes(value)
  ) {
    return value as ServerStatusFilter;
  }
  return "active";
}

export function getAssessment(params: {
  isActive: boolean;
  hasPrice: boolean;
  hasHwInfo: boolean;
  hasAnyBenchmark: boolean;
  hasAllBenchmarks: boolean;
}): ServerAssessment {
  if (!params.isActive || !params.hasPrice) {
    return {
      kind: "unavailable",
      icon: "circle-x",
      tooltip: "Currently unavailable server type.",
    };
  }

  if (params.hasAllBenchmarks) {
    return {
      kind: "fully_evaluated",
      icon: "circle-check-big",
      tooltip: "Fully evaluated.",
    };
  }

  if (!params.hasHwInfo && !params.hasAnyBenchmark) {
    return {
      kind: "cannot_evaluate",
      icon: "circle-alert",
      tooltip: "Cannot evaluate due to vendor quotas or budget constraints.",
    };
  }

  return {
    kind: "in_progress",
    icon: "clock",
    tooltip: "Evaluation in progress, some benchmarks are missing.",
  };
}

export function normalizeBenchmarkFamilyFilters(
  value: unknown,
): Record<string, BenchmarkFamilyFilterValue> {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim())
      .filter((entry) => entry.length > 0)
      .reduce(
        (acc, family) => {
          acc[family] = "yes";
          return acc;
        },
        {} as Record<string, BenchmarkFamilyFilterValue>,
      );
  }

  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [family, rawSelection]) => {
      if (!family) {
        return acc;
      }

      if (rawSelection === "yes" || rawSelection === true) {
        acc[family] = "yes";
        return acc;
      }

      if (rawSelection === "no" || rawSelection === false) {
        acc[family] = "no";
      }

      return acc;
    },
    {} as Record<string, BenchmarkFamilyFilterValue>,
  );
}
