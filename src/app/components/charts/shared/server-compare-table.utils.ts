type BenchmarkValue = number | string | null | undefined;

type TableBenchmarkLike = {
  higher_is_better?: boolean | null;
};

type TableColumnLike = {
  id: string;
  unit?: string | null;
};

type TableServerLike = {
  memory_amount?: number | null;
  gpu_memory_min?: number | null;
  gpu_memory_total?: number | null;
  storage_size?: number | null;
};

export function formatNumberWithCommas(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getBestBenchmarkCellStyle(
  value: BenchmarkValue,
  values: BenchmarkValue[],
  benchmark: TableBenchmarkLike | null | undefined,
  bestCellStyle: string,
) {
  const numericValue = toFiniteNumber(value);
  if (value === "-" || numericValue === undefined || numericValue === 0) {
    return "";
  }

  let isBest = true;
  values.forEach((candidate) => {
    const numericCandidate = toFiniteNumber(candidate);
    if (numericCandidate !== undefined) {
      if (benchmark?.higher_is_better === false) {
        if (numericCandidate < numericValue) {
          isBest = false;
        }
      } else if (numericCandidate > numericValue) {
        isBest = false;
      }
    }
  });

  return isBest ? bestCellStyle : "";
}

export function getBestPropertyCellStyle(
  name: string,
  server: TableServerLike,
  servers: TableServerLike[],
  bestCellStyle: string,
) {
  const prop = getServerFieldValue(server, name);
  if (prop === undefined || prop === null || prop === 0 || !servers?.length) {
    return "";
  }

  if (typeof prop !== "number") {
    return "";
  }

  const values = servers
    .map((item) => getServerFieldValue(item, name))
    .filter(isFiniteNumber);

  if (values.length === 0) {
    return "";
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  return prop === max && max > min ? bestCellStyle : "";
}

export function getServerPropertyValue(
  column: TableColumnLike,
  server: TableServerLike,
) {
  const name = column.id;
  const prop = getServerFieldValue(server, name);

  if (prop === undefined || prop === null) {
    return undefined;
  }

  if (name === "memory_amount") {
    return `${((server.memory_amount || 0) / 1024).toFixed((server.memory_amount || 0) >= 1024 ? 0 : 1)} GiB`;
  }

  if (name === "gpu_memory_min" || name === "gpu_memory_total") {
    return `${((server.gpu_memory_min || 0) / 1024).toFixed(1)} GB`;
  }

  if (name === "storage_size") {
    if (!server.storage_size) return "-";
    if (server.storage_size < 1000) return `${server.storage_size} GB`;
    return `${(server.storage_size / 1000).toFixed(1)} TB`;
  }

  if (typeof prop === "number") {
    if (column.unit === "byte") {
      return formatBytesToSize(prop);
    }
    return `${prop} ${column.unit || ""}`;
  }

  if (typeof prop === "string") {
    return prop;
  }

  if (Array.isArray(prop)) {
    if (prop.some((value) => value !== null && typeof value === "object")) {
      return undefined;
    }

    return prop
      .filter((value): value is string | number | boolean =>
        ["string", "number", "boolean"].includes(typeof value),
      )
      .join(", ");
  }

  return "-";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getServerFieldValue(server: TableServerLike, name: string) {
  return (server as Record<string, unknown> | null | undefined)?.[name];
}

function toFiniteNumber(value: unknown): number | undefined {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  return undefined;
}

function formatBytesToSize(bytes: number) {
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TB"];
  if (bytes === 0) return "0 Byte";
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(0)} ${sizes[index]}`;
}
