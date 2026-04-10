import { TestBed } from "@angular/core/testing";
import { AdvisorUiService } from "./advisor-ui.service";

describe("AdvisorUiService", () => {
  let service: AdvisorUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvisorUiService);
  });

  it("returns 0 for zero scores", () => {
    expect(service.formatScore(0)).toBe("0");
  });

  it("returns the empty value for nullish scores", () => {
    expect(service.formatScore(null)).toBe("-");
    expect(service.formatScore(undefined)).toBe("-");
  });
});
