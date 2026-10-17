import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NvbandwidthCardComponent } from "./nvbandwidth-card.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import { ResourceType, Status } from "../../../../../sdk/data-contracts";

describe("NvbandwidthCardComponent", () => {
  let component: NvbandwidthCardComponent;
  let fixture: ComponentFixture<NvbandwidthCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NvbandwidthCardComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(NvbandwidthCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector("#nvbandwidth")).toBeNull();
  });

  it("renders sections and environment when nvbandwidth scores exist", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "nvbandwidth:all:host_to_gpu",
        name: "Node host-to-GPU bandwidth (nvbandwidth)",
        subcategory: "Node (all GPUs)",
        description: "Total node ingest rate.",
        framework: "nvbandwidth",
        category: "GPU bandwidth",
        unit: "GB/s",
        environment_fields: { gpu_count: "Number of GPUs." },
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("benchmarkScores", [
      {
        vendor_id: "azure",
        benchmark_id: "nvbandwidth:all:host_to_gpu",
        resource_type: ResourceType.Server,
        resource_id: "Standard_NC48ads_A100_v4",
        score: 53.37,
        environment: { gpu_count: 2 },
      },
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Node (all GPUs)");
    expect(text).toContain("Node host-to-GPU bandwidth");
    expect(text).toContain("53.4 GB/s");
    expect(text).toContain("GPU Count");
  });
});
