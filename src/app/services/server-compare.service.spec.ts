import { TestBed } from "@angular/core/testing";

import { ServerCompareService } from "./server-compare.service";

describe("ServerCompareService", () => {
  let service: ServerCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerCompareService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
