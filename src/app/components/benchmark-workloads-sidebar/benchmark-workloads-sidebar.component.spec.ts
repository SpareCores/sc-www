import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsSidebarComponent } from "./benchmark-workloads-sidebar.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkWorkloadsSidebarComponent", () => {
  let component: BenchmarkWorkloadsSidebarComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadsSidebarComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadsSidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("benchmarkFamilies", []);
    fixture.componentRef.setInput("isCollapsed", false);
    fixture.componentRef.setInput("activeBenchmarkId", "");
    fixture.componentRef.setInput("expandedFamily", null);
    fixture.componentRef.setInput("activeFamily", "");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service when the sidebar is collapsed", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("button");

    fixture.componentRef.setInput("isCollapsed", true);
    fixture.detectChanges();

    component.showSidebarTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Geekbench",
    );

    expect(component.tooltipContent()).toBe("Geekbench");
    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltipEl()?.nativeElement as HTMLElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-above",
      },
    );

    component.hideSidebarTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(
      component.tooltipEl()?.nativeElement,
    );
  });
});
