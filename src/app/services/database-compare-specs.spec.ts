import { TestBed } from "@angular/core/testing";

import { DatabaseCompareSpecs } from "./database-compare-specs";
import { LoadedCompareDatabase } from "./database-compare-specs.types";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("DatabaseCompareSpecs", () => {
  let service: DatabaseCompareSpecs;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...sharedTestingProviders] });
    service = TestBed.inject(DatabaseCompareSpecs);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("builds section anchor ids from section names", () => {
    expect(service.sectionAnchorId("Engine & Storage")).toBe(
      "spec_line_engine_storage",
    );
  });

  it("highlights the lowest hourly price", () => {
    const rows = service.buildPriceRows([
      {
        vendor_id: "aws",
        benchmark_scores: [],
        bestHourPrice: { price: 0.2, currency: "USD", unit: "hour" },
      },
      {
        vendor_id: "gcp",
        benchmark_scores: [],
        bestHourPrice: { price: 0.1, currency: "USD", unit: "hour" },
      },
    ] as unknown as LoadedCompareDatabase[]);
    const hourRow = rows.find((row) => row.id === "best_hour");

    expect(hourRow).toBeDefined();
    expect(service.bestCellStyle(hourRow!, 1)).not.toBe("");
    expect(service.bestCellStyle(hourRow!, 0)).toBe("");
  });
});
