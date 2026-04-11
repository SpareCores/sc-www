import { TestBed } from "@angular/core/testing";
import { AdvisorUiService } from "./advisor-ui.service";
import { AdvisorBaselineServer } from "./advisor.types";

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

  it("filters baseline servers after two characters by default", () => {
    const servers: AdvisorBaselineServer[] = [
      { vendor_id: "gcp", api_reference: "n2-standard-4" },
      { vendor_id: "aws", api_reference: "c7g.large" },
    ];

    expect(service.filterBaselineServers(servers, "g")).toEqual([]);
    expect(service.filterBaselineServers(servers, "gc")).toEqual([servers[0]]);
  });

  it("sorts matched baseline servers by vcpus, memory, vendor, and api reference", () => {
    const servers: AdvisorBaselineServer[] = [
      {
        vendor_id: "gcp",
        api_reference: "sort-a",
        vcpus: 8,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-z",
        vcpus: 4,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-a",
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "azure",
        api_reference: "sort-b",
        vcpus: 4,
        memory_amount: 4096,
      },
    ];

    expect(service.filterBaselineServers(servers, "so")).toEqual([
      servers[2],
      servers[3],
      servers[1],
      servers[0],
    ]);
  });

  it("places matched baseline servers with missing numeric values last", () => {
    const servers: AdvisorBaselineServer[] = [
      {
        vendor_id: "aws",
        api_reference: "sort-complete",
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-missing-memory",
        vcpus: 4,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-missing-vcpu",
        memory_amount: 4096,
      },
    ];

    expect(service.filterBaselineServers(servers, "so")).toEqual([
      servers[0],
      servers[1],
      servers[2],
    ]);
  });
});
