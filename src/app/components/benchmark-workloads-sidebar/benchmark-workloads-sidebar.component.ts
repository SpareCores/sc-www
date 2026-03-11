import {
  Component,
  PLATFORM_ID,
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

  isFamilyExpanded(framework: string): boolean {
    return this.expandedFamily() === framework;
  }

  isFamilyHighlighted(framework: string): boolean {
    if (this.isCollapsed()) {
      return this.activeFamily() === framework;
    }
    return (
      this.expandedFamily() === framework || this.activeFamily() === framework
    );
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
    const win = document.defaultView;
    const scrollY = win?.scrollY ?? document.documentElement.scrollTop;

    this.tooltipState.set({
      content,
      visible: true,
      left: rect.right + 8,
      top: rect.top - 8 + scrollY,
    });
  }

  hideSidebarTooltip(): void {
    this.tooltipState.update((state) => ({ ...state, visible: false }));
  }
}
