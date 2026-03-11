import {
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { BenchmarkFamily } from "../../pages/benchmark-workloads/benchmark-workloads.component";

@Component({
  selector: "app-benchmark-workloads-sidebar",
  imports: [CommonModule, LucideAngularModule],
  templateUrl: "./benchmark-workloads-sidebar.component.html",
  styleUrl: "./benchmark-workloads-sidebar.component.scss",
})
export class BenchmarkWorkloadsSidebarComponent {
  private platformId = inject(PLATFORM_ID);
  private hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  benchmarkFamilies = input.required<BenchmarkFamily[]>();
  isCollapsed = input.required<boolean>();
  activeBenchmarkId = input.required<string>();
  expandedFamily = input.required<string | null>();
  activeFamily = input.required<string>();

  toggleCollapseEvent = output<void>();
  familyClick = output<string>();
  benchmarkClick = output<string>();

  readonly tooltipState = signal({
    content: "",
    visible: false,
    top: 0,
    left: 0,
  });

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

    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const hostRect = this.hostEl.nativeElement.getBoundingClientRect();

    this.tooltipState.set({
      content,
      visible: true,
      left: rect.right - hostRect.left + 6,
      top: rect.top - hostRect.top - 10,
    });
  }

  hideSidebarTooltip(): void {
    this.tooltipState.update((state) => ({ ...state, visible: false }));
  }
}
