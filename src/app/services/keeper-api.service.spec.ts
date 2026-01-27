import { TestBed } from "@angular/core/testing";

import { KeeperAPIService } from "./keeper-api.service";

describe("KeeperAPIService", () => {
  let service: KeeperAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeeperAPIService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
