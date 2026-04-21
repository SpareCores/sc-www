import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareChartsComponent } from "./server-compare-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerCompareChartsComponent", () => {
  let component: ServerCompareChartsComponent;
  let fixture: ComponentFixture<ServerCompareChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareChartsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareChartsComponent);
    component = fixture.componentInstance;
    component.showChart = "__test__";
    component.benchmarkMeta = [];
    component.benchmarkCategories = [];
    component.instanceProperties = [];
    component.instancePropertyCategories = [];
    component.servers = [];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders Further Benchmarks labels in a dedicated first column cell", () => {
    component.servers = [
      {
        vendor_id: "aws",
        server_id: "server-a",
        display_name: "Server A",
      },
      {
        vendor_id: "gcp",
        server_id: "server-b",
        display_name: "Server B",
      },
    ] as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "workload:web-server",
        benchmark_key: "workload:web-server",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        collapsed: true,
        configs: [
          {
            config: { profile: "web" },
            values: [10, 20],
          },
        ],
      },
    ];

    fixture.detectChanges();

    const tableRows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("tbody tr"),
    ) as HTMLTableRowElement[];

    const benchmarkRow = tableRows.find((row) =>
      row.textContent?.includes("Workload profile: Web server"),
    );

    expect(benchmarkRow).toBeDefined();

    const cells = benchmarkRow?.querySelectorAll("td");

    expect(cells?.length).toBe(2);
    expect(cells?.[0].textContent).toContain("Workload profile: Web server");
    expect(cells?.[0].hasAttribute("colspan")).toBeFalse();
    expect(cells?.[1].getAttribute("colspan")).toBe("2");
  });
});
