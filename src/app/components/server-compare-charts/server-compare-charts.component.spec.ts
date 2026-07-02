import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareChartsComponent } from "./server-compare-charts.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { Status } from "../../../../sdk/data-contracts";

describe("ServerCompareChartsComponent", () => {
  let component: ServerCompareChartsComponent;
  let fixture: ComponentFixture<ServerCompareChartsComponent>;

  function buildServers(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      vendor_id: `vendor-${index}`,
      server_id: `server-${index}`,
      display_name: `Server ${index}`,
    }));
  }

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
        status: Status.Active,
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

    expect(cells?.length).toBe(1);
    expect(cells?.[0].getAttribute("colspan")).toBe("4");
    expect(cells?.[0].textContent).toContain("OpenSSL");
    expect(cells?.[0].querySelector("button")).toBeTruthy();

    const title = benchmarkRow?.querySelector(
      ".compare-section-header-title",
    ) as HTMLElement | null;
    const titleText = title?.querySelector(
      ".compare-section-header-title__text",
    ) as HTMLElement | null;
    const titleIcons = title?.querySelector(
      ".compare-section-header-title__icons",
    ) as HTMLElement | null;

    expect(title).toBeTruthy();
    expect(titleText?.textContent).toContain("OpenSSL");
    expect(titleIcons?.querySelectorAll("svg").length).toBe(2);
    expect(getComputedStyle(title as HTMLElement).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(titleText as HTMLElement).whiteSpace).toBe(
      "nowrap",
    );
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
        status: Status.Active,
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

    expect(cells?.length).toBe(1);
    expect(cells?.[0].getAttribute("colspan")).toBe("4");
    expect(cells?.[0].querySelector("app-benchmark-line-chart")).toBeTruthy();
    expect(chartContent?.style.width).toBe("100%");
    expect(chartContent?.style.maxWidth).toBe("100%");
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

    expect(titleCells?.length).toBe(1);
    expect(titleCells?.[0].getAttribute("colspan")).toBe("4");

    expect(chartCells?.length).toBe(1);
    expect(chartCells?.[0].getAttribute("colspan")).toBe("4");
    expect(
      chartCells?.[0].querySelector("app-benchmark-multi-bar-chart"),
    ).toBeTruthy();
    expect(chartContent?.style.width).toBe("100%");
    expect(chartContent?.style.maxWidth).toBe("100%");
  });

  it("keeps benchmark category title and chart sticky spans capped for many servers", () => {
    mountTableHolder(1200);

    component.servers = buildServers(9) as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "openssl",
        benchmark_key: "openssl",
        name: "OpenSSL",
        description: "OpenSSL benchmark",
        collapsed: true,
        configs: [],
        status: Status.Active,
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

    const titleRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_openssl",
    ) as HTMLTableRowElement | null;
    const chartRow = titleRow?.nextElementSibling as HTMLTableRowElement | null;

    expect(titleRow).toBeTruthy();
    expect(chartRow).toBeTruthy();

    const titleCells = titleRow?.querySelectorAll(":scope > td");
    const chartCells = chartRow?.querySelectorAll(":scope > td");

    expect(titleCells?.length).toBe(3);
    expect(titleCells?.[0].getAttribute("colspan")).toBe("3");
    expect(titleCells?.[1].getAttribute("colspan")).toBe("6");
    expect(titleCells?.[2].getAttribute("colspan")).toBe("1");

    expect(chartCells?.length).toBe(2);
    expect(chartCells?.[0].getAttribute("colspan")).toBe("3");
    expect(chartCells?.[1].getAttribute("colspan")).toBe("7");
  });

  it("renders embedded benchmark rows full width without trailing filler cells", () => {
    component.isEmbedded = true;
    component.servers = buildServers(5) as unknown as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "llm_inference",
        benchmark_key: "llm_inference",
        name: "LLM Inference Speed",
        description: "LLM inference benchmark",
        collapsed: true,
        configs: [],
        status: Status.Active,
      },
    ];
    component.benchmarkCategories = [
      {
        id: "llm_inference",
        name: "LLM Inference Speed",
        benchmarks: ["llm_inference"],
        data: [{ benchmark_id: "llm_inference" }],
        show_more: false,
        hidden: false,
      },
    ];

    fixture.detectChanges();

    const titleRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_llm_inference",
    ) as HTMLTableRowElement | null;
    const chartRow = titleRow?.nextElementSibling as HTMLTableRowElement | null;

    expect(titleRow).toBeTruthy();
    expect(chartRow).toBeTruthy();

    const titleCells = titleRow?.querySelectorAll(":scope > td");
    const chartCells = chartRow?.querySelectorAll(":scope > td");

    expect(titleCells?.length).toBe(1);
    expect(titleCells?.[0].getAttribute("colspan")).toBe("6");

    expect(chartCells?.length).toBe(1);
    expect(chartCells?.[0].getAttribute("colspan")).toBe("6");
    expect(
      chartCells?.[0].querySelector("app-llm-inference-chart"),
    ).toBeTruthy();
  });

  it("keeps multi-bar title and chart sticky spans capped for many servers", () => {
    mountTableHolder(1200);

    component.showChart = "static_web";
    component.servers = buildServers(9) as unknown as typeof component.servers;

    fixture.detectChanges();

    const titleRow = (fixture.nativeElement as HTMLElement).querySelector(
      "#benchmark_line_static_web",
    ) as HTMLTableRowElement | null;
    const chartRow = titleRow?.nextElementSibling as HTMLTableRowElement | null;

    expect(titleRow).toBeTruthy();
    expect(chartRow).toBeTruthy();

    const titleCells = titleRow?.querySelectorAll(":scope > td");
    const chartCells = chartRow?.querySelectorAll(":scope > td");

    expect(titleCells?.length).toBe(3);
    expect(titleCells?.[0].getAttribute("colspan")).toBe("3");
    expect(titleCells?.[1].getAttribute("colspan")).toBe("6");
    expect(titleCells?.[2].getAttribute("colspan")).toBe("1");

    expect(chartCells?.length).toBe(2);
    expect(chartCells?.[0].getAttribute("colspan")).toBe("3");
    expect(chartCells?.[1].getAttribute("colspan")).toBe("7");
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
        status: Status.Active,
      },
      {
        benchmark_id: "sc-membench:write",
        benchmark_key: "sc-membench:write",
        name: "sc-membench: Write",
        description: "Write benchmark",
        collapsed: true,
        configs: [{ config: { size_kb: 16 }, values: [4, 5, 6] }],
        status: Status.Active,
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
            status: Status.Active,
          },
          {
            benchmark_id: "sc-membench:write",
            benchmark_key: "sc-membench:write",
            name: "sc-membench: Write",
            description: "Write benchmark",
            collapsed: true,
            configs: [{ config: { size_kb: 16 }, values: [4, 5, 6] }],
            status: Status.Active,
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

    expect(cells?.length).toBe(3);
    expect(cells?.[0].getAttribute("colspan")).toBe("1");
    expect(cells?.[0].textContent).toContain("sc-membench: Latency");
    expect(cells?.[1].getAttribute("colspan")).toBe("2");
    expect(cells?.[2].getAttribute("colspan")).toBe("1");
    expect(cells?.[2].querySelector("svg")).toBeTruthy();
  });

  it("renders workload profiles in a dedicated section above benchmark categories", () => {
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
            values: [10, 20, 30],
          },
        ],
        status: Status.Active,
      },
    ];

    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector("#benchmark_line_workload_profile")).toBeTruthy();
    expect(root.querySelector("app-workload-profile-panel")).toBeTruthy();
    expect(root.textContent).toContain("Web server");
    expect(root.textContent).not.toContain("Further Benchmarks");
  });

  it("renders flat workload profile detail rows for compared servers", () => {
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
        status: Status.Active,
      },
    ];

    fixture.detectChanges();

    component.toggleWorkloadProfileDetails();
    fixture.detectChanges();

    const tableRows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("tbody tr"),
    ) as HTMLTableRowElement[];

    const benchmarkRow = tableRows.find((row) => {
      const cells = row.querySelectorAll(":scope > td");
      return (
        cells.length === 3 &&
        cells[0].textContent?.includes("Web server") &&
        !cells[0].textContent?.includes("Workload profile:")
      );
    });

    expect(benchmarkRow).toBeDefined();
    expect(
      benchmarkRow?.classList.contains("compare-fixed-header-row"),
    ).toBeFalse();

    const cells = benchmarkRow?.querySelectorAll(":scope > td");

    expect(cells?.length).toBe(3);
    expect(cells?.[0].textContent).toContain("Web server");
    expect(cells?.[1].classList.contains("compact-number")).toBeTrue();
    expect(cells?.[1].textContent?.trim()).toBe("10.00");
    expect(cells?.[2].classList.contains("compact-number")).toBeTrue();
    expect(cells?.[2].textContent?.trim()).toBe("20.00");
    expect(
      benchmarkRow?.querySelector(
        'button[aria-label="Expand benchmark details"]',
      ),
    ).toBeNull();
  });
});
