import { TestBed } from "@angular/core/testing";

import { ArticlesService } from "./articles.service";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("ArticlesService", () => {
  let service: ArticlesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...sharedTestingProviders],
    });
    service = TestBed.inject(ArticlesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
