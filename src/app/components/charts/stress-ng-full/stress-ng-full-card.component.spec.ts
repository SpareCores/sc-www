import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StressNgFullCardComponent } from "./stress-ng-full-card.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import { ResourceType, Status } from "../../../../../sdk/data-contracts";

describe("StressNgFullCardComponent", () => {
  let component: StressNgFullCardComponent;
  let fixture: ComponentFixture<StressNgFullCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StressNgFullCardComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(StressNgFullCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector("#stress_ng_full")).toBeNull();
  });

  it("renders single, multi and scaling values per subcategory", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "stress_ng:mtx",
        name: "stress-ng mtx",
        category: "stress-ng",
        subcategory: "Hypervisor",
        framework: "stress_ng",
        unit: "Bogo operations per second (ops/s)",
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("benchmarkScores", [
      {
        vendor_id: "aws",
        benchmark_id: "stress_ng:mtx",
        resource_type: ResourceType.Server,
        resource_id: "m9g.2xlarge",
        config: { cores: "single" },
        score: 1000,
      },
      {
        vendor_id: "aws",
        benchmark_id: "stress_ng:mtx",
        resource_type: ResourceType.Server,
        resource_id: "m9g.2xlarge",
        config: { cores: "multi" },
        score: 8000,
      },
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Hypervisor");
    expect(text).toContain("mtx");
    expect(text).toContain("8,000");
    expect(text).toContain("8.00×");
  });
});
