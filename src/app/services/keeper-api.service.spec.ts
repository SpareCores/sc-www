import { TestBed } from "@angular/core/testing";

import { KeeperAPIService } from "./keeper-api.service";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("KeeperAPIService", () => {
  let service: KeeperAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...sharedTestingProviders],
    });
    service = TestBed.inject(KeeperAPIService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
