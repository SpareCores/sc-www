import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkMultiBarChartComponent } from "./benchmark-multi-bar-chart.component";
import { DropdownManagerService } from "../../../services/dropdown-manager.service";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  BenchmarkMultiBarChartItem,
  MultiBarBenchmarkGroup,
  MultiBarBenchmarkMeta,
  MultiBarServer,
} from "./benchmark-multi-bar-chart.types";

describe("BenchmarkMultiBarChartComponent", () => {
  let component: BenchmarkMultiBarChartComponent;
  let fixture: ComponentFixture<BenchmarkMultiBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkMultiBarChartComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: DropdownManagerService,
          useValue: {
            initDropdown: () => Promise.resolve(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkMultiBarChartComponent);
    component = fixture.componentInstance;
    const chartItem: BenchmarkMultiBarChartItem = {
      chart: {
        id: "static_web",
        name: "Static Web Server",
        selectedOption: 0,
        selectedSecondaryOption: 0,
        options: [
          {
            benchmark_id: "static_web:rps",
            labelsField: "size",
            scaleField: "connections_per_vcpus",
            tooltip: "Higher is better",
            icon: "circle-arrow-up",
          },
          {
            benchmark_id: "static_web:throughput",
            labelsField: "size",
            scaleField: "connections_per_vcpus",
            tooltip: "Higher is better",
            icon: "circle-arrow-up",
          },
        ],
        secondaryOptions: [{ name: "Connections per vCPU(s): 1", value: 1 }],
        chartOptions: {
          scales: { x: { title: { text: "" } }, y: { title: { text: "" } } },
          plugins: { title: { text: "" }, tooltip: { callbacks: {} } },
        },
        chartType: "bar",
        chartData: { labels: [1], datasets: [{ data: [100], label: "1 KB" }] },
      },
      show_more: false,
    };
    const benchmarkMeta: MultiBarBenchmarkMeta[] = [
      {
        benchmark_id: "static_web:rps",
        name: "Static web server+client speed",
        description: "Static web throughput",
        unit: "req/s",
        higher_is_better: true,
        config_fields: {
          size: "File size",
          connections_per_vcpus: "Connections per vCPU(s)",
        },
      },
      {
        benchmark_id: "static_web:throughput",
        name: "Static web throughput",
        description: "Static web bandwidth",
        unit: "MiB/s",
        higher_is_better: true,
        config_fields: {
          size: "File size",
          connections_per_vcpus: "Connections per vCPU(s)",
        },
      },
    ];
    const detailsBenchmarks: MultiBarBenchmarkGroup[] = [
      {
        benchmark_id: "static_web:rps",
        benchmarks: [
          {
            benchmark_id: "static_web:rps",
            config: { size: "1 KB", connections_per_vcpus: 1 },
            score: 100,
            note: "baseline",
          },
        ],
      },
      {
        benchmark_id: "static_web:throughput",
        benchmarks: [
          {
            benchmark_id: "static_web:throughput",
            config: { size: "1 KB", connections_per_vcpus: 1 },
            score: 200,
            note: "baseline",
          },
        ],
      },
    ];

    fixture.componentRef.setInput("chartItem", chartItem);
    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.componentRef.setInput("detailsBenchmarks", detailsBenchmarks);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.currentOption()?.name).toBe(
      "Static web server+client speed",
    );
  });

  it("emits selection changes", () => {
    spyOn(component.optionSelected, "emit");
    component.selectOption(1);
    fixture.detectChanges();

    expect(component.optionSelected.emit).toHaveBeenCalledWith(1);
    expect(component.currentOption()?.name).toBe("Static web throughput");
  });

  it("shows the benchmark description from metadata", () => {
    expect(component.currentBenchmarkDescription()).toBe(
      "Static web throughput",
    );
  });

  it("updates the compare secondary option locally", () => {
    const chartItem: BenchmarkMultiBarChartItem = {
      chart: {
        id: "redis",
        name: "Redis",
        selectedOption: 0,
        selectedSecondaryOption: 0,
        options: [
          {
            benchmark_id: "redis:rps",
            labelsField: "operation",
            scaleField: "pipeline",
          },
        ],
        secondaryOptions: [
          { name: "SET", value: "SET" },
          { name: "GET", value: "GET" },
        ],
        chartOptions: {
          scales: { x: { title: { text: "" } }, y: { title: { text: "" } } },
          plugins: { title: { text: "" }, tooltip: { callbacks: {} } },
        },
        chartType: "bar",
      },
      show_more: false,
    };
    const benchmarkMeta: MultiBarBenchmarkMeta[] = [
      {
        benchmark_id: "redis:rps",
        name: "Redis server+client speed",
        unit: "ops/s",
        higher_is_better: true,
        config_fields: { operation: "Operation", pipeline: "Pipeline" },
        configs: [
          { config: { operation: "SET", pipeline: 1 } },
          { config: { operation: "GET", pipeline: 1 } },
        ],
      },
    ];
    const servers: MultiBarServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            benchmark_id: "redis:rps",
            config: { operation: "SET", pipeline: 1 },
            score: 100,
          },
          {
            benchmark_id: "redis:rps",
            config: { operation: "GET", pipeline: 1 },
            score: 120,
          },
        ],
      },
    ];

    fixture.componentRef.setInput("chartItem", chartItem);
    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.componentRef.setInput("servers", servers);
    fixture.componentRef.setInput("layout", "compare");
    fixture.detectChanges();

    component.selectSecondaryOption(1);
    fixture.detectChanges();

    expect(component.currentSecondaryOption()?.name).toBe("GET");
  });
});
