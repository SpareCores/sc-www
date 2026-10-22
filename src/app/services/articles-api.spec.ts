import { TestBed } from "@angular/core/testing";

import { ArticlesApi } from "./articles-api";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("ArticlesApi", () => {
  let service: ArticlesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...sharedTestingProviders],
    });
    service = TestBed.inject(ArticlesApi);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
