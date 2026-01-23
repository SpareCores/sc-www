import {
  CommonModule,
  isPlatformBrowser,
  NgOptimizedImage,
} from "@angular/common";
import {
  Component,
  HostListener,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
} from "@angular/core";

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
export class DownloadableLogoCollectionComponent implements OnChanges {
  @Input() folderName: string = "";
  @Input() fileNames: string[] = [];
  @Input() basePath: string = "assets/images/logos/download";

  downloadItems: DownloadItemVm[] = [];
  isOpen = false;

  private readonly isBrowser: boolean;

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
      this.isOpen = false;
    }
  }

  get previewSrc(): string {
    if (!this.folderName || !this.fileNames?.length) {
      throw new Error(
        "Logo preview source is unavailable: missing folderName or fileNames.",
      );
    }

    return `${this.basePath}/${this.folderName}/${this.fileNames[this.fileNames.length - 1]}`;
  }

  get downloadsToggleId(): string {
    return `sc-downloads-toggle-${this.safeIdPart}`;
  }

  get downloadsDropdownId(): string {
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

  onToggleClick(): void {
    if (!this.isBrowser) return;

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Wait for the dropdown to render, then ensure it is within viewport.
      setTimeout(() => this.scrollDropdownIntoViewIfNeeded(), 0);
    }
  }

  onDownloadClick(event?: Event): void {
    // Keep download click from toggling ancestor handlers that might reopen it.
    event?.stopPropagation();
    this.closeDropdown();
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser) return;
    if (!this.isOpen) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const toggleEl = document.getElementById(this.downloadsToggleId);
    const panelEl = document.getElementById(this.downloadsDropdownId);

    if (toggleEl && (toggleEl === target || toggleEl.contains(target))) return;
    if (panelEl && (panelEl === target || panelEl.contains(target))) return;

    this.closeDropdown();
  }

  @HostListener("document:keydown.escape")
  handleEscape(): void {
    this.closeDropdown();
  }

  private closeDropdown(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
  }

  private scrollDropdownIntoViewIfNeeded(): void {
    const panelEl = document.getElementById(this.downloadsDropdownId);
    if (!panelEl) return;

    const rect = panelEl.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    const isAbove = rect.top < 0;
    const isBelow = rect.bottom > viewportHeight;

    if (isAbove || isBelow) {
      panelEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
