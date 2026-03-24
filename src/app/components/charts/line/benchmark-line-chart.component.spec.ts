import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkLineChartComponent } from "./benchmark-line-chart.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  BenchmarkLineChartData,
  BenchmarkLineChartOptions,
  BenchmarkLineSelectorOption,
  LineBenchmarkMeta,
  LineChartServer,
} from "./benchmark-line-chart.types";

const chartData: BenchmarkLineChartData = {
  labels: [1],
  datasets: [{ data: [10], label: "A" }],
};

const chartOptions: BenchmarkLineChartOptions = {};
const selectorOptions: BenchmarkLineSelectorOption[] = [{ name: "sha256" }];

describe("BenchmarkLineChartComponent", () => {
  let component: BenchmarkLineChartComponent;
  let fixture: ComponentFixture<BenchmarkLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkLineChartComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkLineChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("chartData", chartData);
    fixture.componentRef.setInput("chartOptions", chartOptions);
    fixture.componentRef.setInput("selectorOptions", selectorOptions);
    fixture.componentRef.setInput("selectedOptionName", "sha256");
    fixture.detectChanges();
  });

  it("creates the presenter", () => {
    expect(component).toBeTruthy();
    expect(component.hasSelector()).toBeTrue();
  });

  it("emits selector changes", () => {
    spyOn(component.selectorSelected, "emit");
    component.selectOption(0);
    expect(component.selectorSelected.emit).toHaveBeenCalledWith(0);
  });

  it("builds compare ssl charts from raw inputs", () => {
    const servers: LineChartServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            vendor_id: "vendor-a",
            server_id: "server-a",
            benchmark_id: "openssl",
            config: { algo: "sha256", block_size: 16 },
            score: 22,
          },
        ],
      },
    ];
    const benchmarkMeta: LineBenchmarkMeta[] = [
      {
        benchmark_id: "openssl",
        name: "OpenSSL",
        description: null,
        framework: "openssl",
        configs: [{ config: { algo: "sha256", block_size: 16 } }],
      },
    ];

    fixture.componentRef.setInput("chartData", undefined);
    fixture.componentRef.setInput("chartOptions", undefined);
    fixture.componentRef.setInput("selectorOptions", []);
    fixture.componentRef.setInput("selectedOptionName", "");
    fixture.componentRef.setInput("chartSource", "compare-ssl");
    fixture.componentRef.setInput("chartType", "bar");
    fixture.componentRef.setInput("servers", servers);
    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.detectChanges();

    expect(component.hasChartData()).toBeTrue();
    expect(component.hasSelector()).toBeTrue();
    expect(component.resolvedSelectedOptionName()).toBe("sha256");
  });
});
