import {
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { BenchmarkFamily } from "../../pages/benchmark-workloads/benchmark-workloads.models";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { UiTooltipService } from "../../services/ui-tooltip.service";

@Component({
  selector: "app-benchmark-workloads-sidebar",
  imports: [CommonModule, LucideAngularModule, BenchmarkIconPipe],
  templateUrl: "./benchmark-workloads-sidebar.component.html",
  styleUrl: "./benchmark-workloads-sidebar.component.scss",
})
export class BenchmarkWorkloadsSidebarComponent {
  private platformId = inject(PLATFORM_ID);
  private uiTooltip = inject(UiTooltipService);

  benchmarkFamilies = input.required<BenchmarkFamily[]>();
  isCollapsed = input.required<boolean>();
  activeBenchmarkId = input.required<string>();
  expandedFamily = input.required<string | null>();
  activeFamily = input.required<string>();

  toggleCollapseEvent = output<void>();
  familyClick = output<string>();
  benchmarkClick = output<string>();

  readonly tooltipContent = signal("");
  readonly tooltipEl = viewChild<ElementRef<HTMLElement>>("tooltipEl");

  familiesWithState = computed(() => {
    const isCollapsed = this.isCollapsed();
    const expandedFam = this.expandedFamily();
    const activeFam = this.activeFamily();

    return this.benchmarkFamilies().map((family) => {
      const framework = family.framework;
      const isExpanded = expandedFam === framework;

      let isHighlighted = false;
      if (isCollapsed) {
        isHighlighted = activeFam === framework;
      } else {
        isHighlighted = isExpanded || activeFam === framework;
      }

      return {
        ...family,
        isExpanded,
        isHighlighted,
      };
    });
  });

  handleFamilyClick(framework: string): void {
    if (this.isCollapsed()) {
      this.hideSidebarTooltip();
    }
    this.familyClick.emit(framework);
  }

  toggleCollapse(): void {
    this.hideSidebarTooltip();
    this.toggleCollapseEvent.emit();
  }

  scrollTo(id: string): void {
    this.benchmarkClick.emit(id);
  }

  showSidebarTooltip(event: MouseEvent | FocusEvent, content: string): void {
    if (!this.isCollapsed() || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const tooltip = this.tooltipEl()?.nativeElement;
    if (!tooltip) {
      return;
    }

    this.tooltipContent.set(content);
    this.uiTooltip.show(tooltip, event, {
      left: "anchor-right",
      top: "anchor-above",
    });
  }

  hideSidebarTooltip(): void {
    this.uiTooltip.hide(this.tooltipEl()?.nativeElement);
  }
}
