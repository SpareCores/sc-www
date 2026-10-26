import { TestBed } from "@angular/core/testing";

import { SeoHandler } from "./seo-handler";

describe("SeoHandler", () => {
  let service: SeoHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoHandler);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
