import { TestBed } from "@angular/core/testing";

import { KeeperAPI } from "./keeper-api";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("KeeperAPI", () => {
  let service: KeeperAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...sharedTestingProviders],
    });
    service = TestBed.inject(KeeperAPI);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
