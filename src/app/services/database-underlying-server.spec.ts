import { TestBed } from "@angular/core/testing";

import { DatabaseUnderlyingServer } from "./database-underlying-server";
import { KeeperAPI } from "./keeper-api";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("DatabaseUnderlyingServer", () => {
  const keeperAPI = {
    getServerV2: jasmine.createSpy("getServerV2"),
    getServerBenchmark: jasmine.createSpy("getServerBenchmark"),
  };

  let service: DatabaseUnderlyingServer;

  beforeEach(() => {
    Object.values(keeperAPI).forEach((spy) => spy.calls.reset());
    keeperAPI.getServerV2.and.resolveTo({
      body: { display_name: "m5.large", api_reference: "m5.large", vcpus: 2 },
    });
    keeperAPI.getServerBenchmark.and.resolveTo({ body: [] });

    TestBed.configureTestingModule({
      providers: [
        ...sharedTestingProviders,
        { provide: KeeperAPI, useValue: keeperAPI },
      ],
    });
    service = TestBed.inject(DatabaseUnderlyingServer);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("loads the server without scores", async () => {
    const result = await service.load(
      { vendor_id: "aws", server_id: "m5.large" },
      false,
    );

    expect(result.server?.api_reference).toBe("m5.large");
    expect(keeperAPI.getServerBenchmark).not.toHaveBeenCalled();
  });

  it("returns no server when the request fails", async () => {
    keeperAPI.getServerV2.and.rejectWith(new Error("failed"));

    const result = await service.load(
      { vendor_id: "aws", server_id: "m5.large" },
      true,
    );

    expect(result).toEqual({ scores: [] });
  });
});
