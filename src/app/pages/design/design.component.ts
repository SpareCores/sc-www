import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ThemeTextComponent } from "../../components/theme-text/theme-text.component";
import { DesignPageCardComponent } from "../../components/design-page-card/design-page-card.component";
import { DownloadableLogoCollectionComponent } from "../../components/downloadable-logo-collection/downloadable-logo-collection.component";
import { ToastService } from "../../services/toast.service";

type LogoDownloadItems = {
  folderName: string;
  fileNames: string[];
};

type LogoDownloadManifestItem = {
  folder: string;
  files: string[];
};

type LogoDownloadManifest = {
  basePath: string;
  generatedAt: string;
  items: LogoDownloadManifestItem[];
};

@Component({
  selector: "app-design",
  imports: [
    ThemeTextComponent,
    DesignPageCardComponent,
    DownloadableLogoCollectionComponent,
  ],
  templateUrl: "./design.component.html",
  styleUrls: ["./design.component.scss"],
})
export class DesignComponent implements OnInit {
  logoDownloadsBasePath: string = "assets/images/logos/download";
  logoDownloadItems: LogoDownloadItems[] = [];
  logoDownloadManifestPath: string =
    "assets/images/logos/download/download-manifest.json";

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const manifest = await firstValueFrom(
        this.http.get<LogoDownloadManifest>(this.logoDownloadManifestPath),
      );
      this.logoDownloadsBasePath = manifest.basePath;
      this.logoDownloadItems = (manifest.items ?? []).map((item) => ({
        folderName: item.folder,
        fileNames: item.files,
      }));
    } catch (error) {
      console.warn("Failed to load logo download manifest.", error);
    }
  }

  trackByFolder(_index: number, item: LogoDownloadItems): string {
    return item.folderName;
  }

  copyColor(color: string): void {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(color)
        .then(() => {
          this.toastService.show({
            title: "Copied",
            body: `${color} copied to clipboard.`,
            type: "success",
            duration: 2000,
            id: "design-color-copy",
          });
        })
        .catch(() => {
          this.toastService.show({
            title: "Copy failed",
            body: "Unable to copy the color code.",
            type: "error",
            duration: 2500,
            id: "design-color-copy",
          });
        });
    } else {
      this.toastService.show({
        title: "Copy unavailable",
        body: "Clipboard access is not available in this browser.",
        type: "error",
        duration: 2500,
        id: "design-color-copy",
      });
    }
  }
}
