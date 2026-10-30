import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NvbandwidthCard } from "./nvbandwidth-card";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import { ResourceType, Status } from "../../../../../sdk/data-contracts";

describe("NvbandwidthCard", () => {
  let component: NvbandwidthCard;
  let fixture: ComponentFixture<NvbandwidthCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NvbandwidthCard],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(NvbandwidthCard);
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

  it("formats cuda_version and falls back to legacy cuda_runtime_version", () => {
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "nvbandwidth:all:host_to_gpu",
        name: "Node host-to-GPU bandwidth (nvbandwidth)",
        subcategory: "Node (all GPUs)",
        description: "Total node ingest rate.",
        framework: "nvbandwidth",
        category: "GPU bandwidth",
        unit: "GB/s",
        environment_fields: { cuda_version: "CUDA version." },
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("benchmarkScores", [
      {
        vendor_id: "aws",
        benchmark_id: "nvbandwidth:all:host_to_gpu",
        resource_type: ResourceType.Server,
        resource_id: "g7e.12xlarge",
        score: 100,
        environment: { cuda_version: 13020 },
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      "CUDA Version (driver)",
    );
    expect(fixture.nativeElement.textContent).toContain("13.2");

    fixture.componentRef.setInput("benchmarkScores", [
      {
        vendor_id: "aws",
        benchmark_id: "nvbandwidth:all:host_to_gpu",
        resource_type: ResourceType.Server,
        resource_id: "p3.8xlarge",
        score: 100,
        environment: { cuda_runtime_version: 12060 },
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("12.6");
  });
});
