import { TestBed } from "@angular/core/testing";

import { DatabasePgbench, hasPgbenchScores } from "./database-pgbench";
import type { LoadedCompareDatabase } from "./database-compare-specs.types";

describe("DatabasePgbench", () => {
  let service: DatabasePgbench;

  beforeEach(() => {
    service = TestBed.inject(DatabasePgbench);
  });

  it("detects pgbench scores", () => {
    expect(
      hasPgbenchScores([{ benchmark_id: "pgbench:heavy_read_only", score: 1 }]),
    ).toBeTrue();
    expect(hasPgbenchScores([])).toBeFalse();
  });

  it("falls back to the given title without benchmark meta", () => {
    expect(service.meta([], "Fallback")).toEqual({
      title: "Fallback",
      infoTooltip: "",
      noteTooltip: "",
    });
  });

  it("maps compared databases to line chart servers", () => {
    const [server] = service.lineServers([
      {
        display_name: "db",
        vendor_id: "aws",
        vendor: { name: "AWS" },
        api_reference: "db",
        benchmark_scores: [],
      },
    ] as unknown as LoadedCompareDatabase[]);

    expect(server.vendor_name).toBe("AWS");
    expect(server.benchmark_scores).toEqual([]);
  });
});
