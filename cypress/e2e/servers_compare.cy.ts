import { E2EEvent } from "../support/generics";

const BENCHMARKS_COUNT_WITHOUT_STRESSNG = 9;
const BENCHMARKS_COUNT = 11;

describe("Server Compare", () => {
  it("Server with price 1 vCPU", () => {
    E2EEvent.visitURL(
      "/compare?instances=W3siZGlzcGxheV9uYW1lIjoidDJhLXN0YW5kYXJkLTEiLCJ2ZW5kb3IiOiJnY3AiLCJzZXJ2ZXIiOiJ0MmEtc3RhbmRhcmQtMSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiYzdnLm1lZGl1bSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6ImM3Zy5tZWRpdW0iLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D",
      4000,
    );

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="main-table"]`);

    E2EEvent.countElements(`[id="main-table"]`, `[id="main-table-th"]`, 2);

    E2EEvent.countElements(
      `[id="main-table"]`,
      `[id^="benchmark_line"]`,
      BENCHMARKS_COUNT_WITHOUT_STRESSNG,
    );
  });

  it("Server with price 36 vCPU", () => {
    E2EEvent.visitURL(
      "/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYzVuLjl4bGFyZ2UifSx7InZlbmRvciI6ImF3cyIsInNlcnZlciI6ImQyLjh4bGFyZ2UifV0%3D",
      4000,
    );

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="main-table"]`);

    E2EEvent.countElements(`[id="main-table"]`, `[id="main-table-th"]`, 2);

    E2EEvent.countElements(
      `[id="main-table"]`,
      `[id^="benchmark_line"]`,
      BENCHMARKS_COUNT,
    );
  });
});
