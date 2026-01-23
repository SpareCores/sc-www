import {
  CommonModule,
  isPlatformBrowser,
  NgOptimizedImage,
} from "@angular/common";
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  HostListener,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
} from "@angular/core";

type PrelineCollapseModule = {
  default?: {
    autoInit?: () => void;
  };
};

type PrelineWindow = Window & {
  HSStaticMethods?: {
    autoInit?: () => void;
  };
};

type DownloadItemVm = {
  file: string;
  href: string;
  downloadName: string;
};

@Component({
  selector: "app-downloadable-logo-collection",
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: "./downloadable-logo-collection.component.html",
  styleUrl: "./downloadable-logo-collection.component.scss",
})
export class DownloadableLogoCollectionComponent
  implements AfterViewInit, OnChanges
{
  @Input() folderName: string = "";
  @Input() fileNames: string[] = [];
  @Input() basePath: string = "assets/images/logos/download";

  downloadItems: DownloadItemVm[] = [];

  private readonly isBrowser: boolean;
  private readonly COLLAPSE_ANIMATION_DELAY_MS = 200;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["fileNames"] || changes["folderName"] || changes["basePath"]) {
      this.downloadItems = (this.fileNames ?? []).map((file) => ({
        file,
        href: this.fileHref(file),
        downloadName: this.fileDownloadName(file),
      }));
    }
  }

  get previewSrc(): string {
    if (this.folderName && this.fileNames?.length) {
      return `${this.basePath}/${this.folderName}/${this.fileNames[this.fileNames.length - 1]}`;
    }

    return "assets/images/logos/sc-logo-only-square-256x256.webp";
  }

  get downloadsToggleId(): string {
    return `sc-downloads-toggle-${this.safeIdPart}`;
  }

  get downloadsCollapseId(): string {
    return `sc-downloads-${this.safeIdPart}`;
  }

  private fileHref(file: string): string {
    const cleanBase = (this.basePath || "").replace(/\/+$/, "");
    const cleanFolder = (this.folderName || "").replace(/^\/+|\/+$/g, "");
    const cleanFile = (file || "").replace(/^\/+/, "");

    return `${cleanBase}/${cleanFolder}/${cleanFile}`;
  }

  private fileDownloadName(file: string): string {
    const prefix = this.safeIdPart || "logo";
    return `${prefix}-${file}`;
  }

  trackByFile(_index: number, item: DownloadItemVm): string {
    return item.file;
  }

  private get safeIdPart(): string {
    const base = this.folderName?.trim() || "default";
    return base
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    let collapseModule: PrelineCollapseModule;
    try {
      collapseModule =
        (await import("@preline/collapse")) as PrelineCollapseModule;
    } catch (error) {
      console.warn("Failed to load @preline/collapse:", error);
      return;
    }

    if (typeof collapseModule.default?.autoInit === "function") {
      collapseModule.default.autoInit();
      return;
    }

    const w = window as PrelineWindow;
    if (typeof w.HSStaticMethods?.autoInit === "function") {
      w.HSStaticMethods.autoInit();
      return;
    }
  }

  onDownloadClick(): void {
    this.closeCollapseIfOpen();
  }

  onToggleClick(): void {
    if (!this.isBrowser) return;
    setTimeout(
      () => this.scrollCollapseIntoViewIfOpen(),
      this.COLLAPSE_ANIMATION_DELAY_MS,
    );
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const toggleEl = document.getElementById(this.downloadsToggleId);
    const panelEl = document.getElementById(this.downloadsCollapseId);

    if (toggleEl && (toggleEl === target || toggleEl.contains(target))) return;
    if (panelEl && (panelEl === target || panelEl.contains(target))) return;

    this.closeCollapseIfOpen();
  }

  private closeCollapseIfOpen(): void {
    const toggleEl = document.getElementById(this.downloadsToggleId);
    if (!toggleEl) return;

    const isExpanded = toggleEl.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      toggleEl.dispatchEvent(new Event("click", { bubbles: true }));
    }
  }

  private scrollCollapseIntoViewIfOpen(): void {
    const toggleEl = document.getElementById(this.downloadsToggleId);
    const panelEl = document.getElementById(this.downloadsCollapseId);
    if (!toggleEl || !panelEl) return;

    const isExpanded = toggleEl.getAttribute("aria-expanded") === "true";
    if (!isExpanded || panelEl.clientHeight === 0) return;

    const rect = panelEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const fullyVisible = rect.top >= 0 && rect.bottom <= vh;
    if (fullyVisible) return;

    panelEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
