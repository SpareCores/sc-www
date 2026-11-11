import { TestBed } from "@angular/core/testing";

import { KeeperAPI } from "./keeper-api";
import { ServerEmbedData } from "./server-embed-data";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("ServerEmbedData", () => {
  const server = {
    vendor_id: "aws",
    server_id: "m5.large",
    api_reference: "m5.large",
    display_name: "m5.large",
    min_price: 2,
  };
  const keeperAPI = {
    getServerV2: jasmine.createSpy("getServerV2"),
    getServerMeta: jasmine.createSpy("getServerMeta"),
    getServerBenchmark: jasmine.createSpy("getServerBenchmark"),
    getServerBenchmarkMeta: jasmine.createSpy("getServerBenchmarkMeta"),
    getServerPrices: jasmine.createSpy("getServerPrices"),
    getRegions: jasmine.createSpy("getRegions"),
    getZones: jasmine.createSpy("getZones"),
    getServerDescriptions: jasmine.createSpy("getServerDescriptions"),
  };

  let service: ServerEmbedData;

  beforeEach(() => {
    Object.values(keeperAPI).forEach((spy) => spy.calls.reset());
    keeperAPI.getServerV2.and.resolveTo({ body: server });
    keeperAPI.getServerMeta.and.resolveTo({ body: { fields: [] } });
    keeperAPI.getServerBenchmarkMeta.and.resolveTo({ body: [] });
    keeperAPI.getServerBenchmark.and.resolveTo({
      body: [
        { benchmark_id: "stress_ng:bestn", score: 10 },
        { benchmark_id: "passmark:cpu_mark", score: 5 },
      ],
    });

    TestBed.configureTestingModule({
      providers: [
        ...sharedTestingProviders,
        { provide: KeeperAPI, useValue: keeperAPI },
      ],
    });
    service = TestBed.inject(ServerEmbedData);
  });

  it("builds a card widget without loading benchmarks", async () => {
    const model = await service.load("aws", "m5.large", "metadata");

    expect(model?.path).toBe("/server/aws/m5.large");
    expect(model?.card?.cardId).toBe("details");
    expect(keeperAPI.getServerBenchmark).not.toHaveBeenCalled();
  });

  it("groups benchmarks for chart widgets", async () => {
    const model = await service.load("aws", "m5.large", "geek_single");

    expect(
      model?.serverCharts?.benchmarksByCategory.map((g) => g.benchmark_id),
    ).toEqual(["stress_ng:bestn", "passmark:cpu"]);
    expect(model?.serverCharts?.serverDetails["score_per_price"]).toBe(5);
  });

  it("returns null for an unknown server", async () => {
    keeperAPI.getServerV2.and.resolveTo({ body: null });

    expect(await service.load("aws", "missing", "metadata")).toBeNull();
  });
});
