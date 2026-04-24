import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareChartsComponent } from "./server-compare-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerCompareChartsComponent", () => {
  let component: ServerCompareChartsComponent;
  let fixture: ComponentFixture<ServerCompareChartsComponent>;

  function mountTableHolder(width: number): void {
    const existingTableHolder = document.getElementById("table_holder");
    existingTableHolder?.remove();

    const tableHolder = document.createElement("div");
    tableHolder.id = "table_holder";
    Object.defineProperty(tableHolder, "clientWidth", {
      configurable: true,
      value: width,
    });
    document.body.appendChild(tableHolder);
  }

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

  afterEach(() => {
    document.getElementById("table_holder")?.remove();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders benchmark category titles using the fixed header row structure", () => {
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
      {
        vendor_id: "hcloud",
        server_id: "server-c",
        display_name: "Server C",
      },
    ] as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "openssl",
        benchmark_key: "openssl",
        name: "OpenSSL",
        description: "OpenSSL benchmark",
        collapsed: true,
        configs: [],
      },
    ];
    component.benchmarkCategories = [
      {
        id: "openssl",
        name: "OpenSSL",
        benchmarks: ["openssl"],
        data: [{ benchmark_id: "openssl" }],
        show_more: false,
        hidden: false,
      },
    ];

    fixture.detectChanges();

    const benchmarkRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_openssl",
    ) as HTMLTableRowElement | null;

    expect(benchmarkRow).toBeTruthy();

    const cells = benchmarkRow?.querySelectorAll("td");

    expect(cells?.length).toBe(2);
    expect(cells?.[0].getAttribute("colspan")).toBe("3");
    expect(cells?.[0].textContent).toContain("OpenSSL");
    expect(cells?.[1].getAttribute("colspan")).toBe("1");
    expect(cells?.[1].querySelector("button")).toBeTruthy();
  });

  it("renders benchmark category chart rows as full-width rows", () => {
    mountTableHolder(1200);

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
      {
        vendor_id: "hcloud",
        server_id: "server-c",
        display_name: "Server C",
      },
    ] as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "openssl",
        benchmark_key: "openssl",
        name: "OpenSSL",
        description: "OpenSSL benchmark",
        collapsed: true,
        configs: [],
      },
    ];
    component.benchmarkCategories = [
      {
        id: "openssl",
        name: "OpenSSL",
        benchmarks: ["openssl"],
        data: [{ benchmark_id: "openssl" }],
        show_more: false,
        hidden: false,
      },
    ];

    fixture.detectChanges();

    const chartRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_openssl + tr",
    ) as HTMLTableRowElement | null;

    expect(chartRow).toBeTruthy();

    const cells = chartRow?.querySelectorAll(":scope > td");
    const chartContent = chartRow?.querySelector(
      ".compare-chart-content",
    ) as HTMLDivElement | null;

    expect(cells?.length).toBe(2);
    expect(cells?.[0].getAttribute("colspan")).toBe("3");
    expect(cells?.[0].querySelector("app-benchmark-line-chart")).toBeTruthy();
    expect(cells?.[1].getAttribute("colspan")).toBe("1");
    expect(chartContent?.style.width).toBe("1104px");
    expect(chartContent?.style.maxWidth).toBe("1104px");
  });

  it("renders multi-bar chart titles fixed and chart rows full width", () => {
    mountTableHolder(1200);

    component.showChart = "static_web";
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
      {
        vendor_id: "hcloud",
        server_id: "server-c",
        display_name: "Server C",
      },
    ] as unknown as typeof component.servers;

    fixture.detectChanges();

    const titleRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_static_web",
    ) as HTMLTableRowElement | null;
    const chartRow = titleRow?.nextElementSibling as HTMLTableRowElement | null;

    expect(titleRow).toBeTruthy();
    expect(chartRow).toBeTruthy();

    const titleCells = titleRow?.querySelectorAll(":scope > td");
    const chartCells = chartRow?.querySelectorAll(":scope > td");
    const chartContent = chartRow?.querySelector(
      ".compare-chart-content",
    ) as HTMLDivElement | null;

    expect(titleCells?.length).toBe(2);
    expect(titleCells?.[0].getAttribute("colspan")).toBe("3");
    expect(titleCells?.[1].getAttribute("colspan")).toBe("1");

    expect(chartCells?.length).toBe(2);
    expect(chartCells?.[0].getAttribute("colspan")).toBe("3");
    expect(
      chartCells?.[0].querySelector("app-benchmark-multi-bar-chart"),
    ).toBeTruthy();
    expect(chartCells?.[1].getAttribute("colspan")).toBe("1");
    expect(chartContent?.style.width).toBe("1104px");
    expect(chartContent?.style.maxWidth).toBe("1104px");
  });

  it("renders expanded benchmark detail names in fixed split rows", () => {
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
      {
        vendor_id: "hcloud",
        server_id: "server-c",
        display_name: "Server C",
      },
    ] as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "sc-membench:latency",
        benchmark_key: "sc-membench:latency",
        name: "sc-membench: Latency",
        description: "Latency benchmark",
        collapsed: true,
        configs: [{ config: { size_kb: 16 }, values: [1, 2, 3] }],
      },
      {
        benchmark_id: "sc-membench:write",
        benchmark_key: "sc-membench:write",
        name: "sc-membench: Write",
        description: "Write benchmark",
        collapsed: true,
        configs: [{ config: { size_kb: 16 }, values: [4, 5, 6] }],
      },
    ];
    component.benchmarkCategories = [
      {
        id: "bw_mem",
        name: "Memory Bandwidth",
        benchmarks: ["sc-membench:latency", "sc-membench:write"],
        data: [
          {
            benchmark_id: "sc-membench:latency",
            benchmark_key: "sc-membench:latency",
            name: "sc-membench: Latency",
            description: "Latency benchmark",
            collapsed: true,
            configs: [{ config: { size_kb: 16 }, values: [1, 2, 3] }],
          },
          {
            benchmark_id: "sc-membench:write",
            benchmark_key: "sc-membench:write",
            name: "sc-membench: Write",
            description: "Write benchmark",
            collapsed: true,
            configs: [{ config: { size_kb: 16 }, values: [4, 5, 6] }],
          },
        ],
        show_more: true,
        hidden: false,
      },
    ];

    fixture.detectChanges();

    const tableRows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("tbody tr"),
    ) as HTMLTableRowElement[];

    const detailHeaderRow = tableRows.find((row) =>
      row.textContent?.includes("sc-membench: Latency"),
    );

    expect(detailHeaderRow).toBeDefined();
    expect(
      detailHeaderRow?.classList.contains("compare-fixed-header-row"),
    ).toBeTrue();

    const cells = detailHeaderRow?.querySelectorAll(":scope > td");

    expect(cells?.length).toBe(2);
    expect(cells?.[0].getAttribute("colspan")).toBe("3");
    expect(cells?.[1].getAttribute("colspan")).toBe("1");
    expect(cells?.[1].querySelector("lucide-icon")).toBeTruthy();
  });

  it("renders Further Benchmarks labels in a merged header cell with filler cell", () => {
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
      {
        vendor_id: "hcloud",
        server_id: "server-c",
        display_name: "Server C",
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
    expect(cells?.[0].getAttribute("colspan")).toBe("3");
    expect(cells?.[0].textContent).toContain("Workload profile: Web server");
    expect(cells?.[1].getAttribute("colspan")).toBe("1");
    expect(cells?.[1].querySelector("lucide-icon")).toBeTruthy();
  });
});
