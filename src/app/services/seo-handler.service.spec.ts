import { TestBed } from "@angular/core/testing";

import { SeoHandlerService } from "./seo-handler.service";

describe("SeoHandlerService", () => {
  let service: SeoHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoHandlerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
