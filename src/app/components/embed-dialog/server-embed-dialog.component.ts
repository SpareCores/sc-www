import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  PLATFORM_ID,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { PrismService } from "../../services/prism.service";
import { EmbedChartOption } from "./embed-dialog.types";
@Component({
  selector: "sc-server-embed-dialog",
  imports: [FormsModule],
  templateUrl: "./server-embed-dialog.component.html",
  styleUrl: "./server-embed-dialog.component.scss",
})
export class ServerEmbedDialogComponent implements OnChanges, AfterViewInit {
  private static readonly ASPECT_RATIO = 0.6;
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private SEOHandler = inject(SeoHandlerService);
  private prismService = inject(PrismService);

  @Input() vendor!: string;
  @Input() id!: string;
  @Input() chartname!: string;

  src: any;

  height = "510px";
  width: string = "100%";

  @Input() charts: EmbedChartOption[] = [];

  @ViewChild("iframeCodeBlock") iframeCodeBlockElement!: ElementRef;
  @ViewChild("myIframe") iframeRef?: ElementRef<HTMLIFrameElement>;

  ngOnChanges() {
    this.updateSrc();
  }

  ngAfterViewInit() {
    setTimeout(() => this.adjustIframeHeight());
  }
  @HostListener("window:resize")
  onResize() {
    this.adjustIframeHeight();
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private adjustIframeHeight() {
    if (!this.isBrowser() || !this.iframeRef?.nativeElement) {
      return;
    }

    const iframeEl = this.iframeRef.nativeElement;
    const heightPx =
      iframeEl.offsetWidth * ServerEmbedDialogComponent.ASPECT_RATIO + "px";
    this.height = heightPx;
  }

  getStyles() {
    return {
      height: this.height,
      width: this.width,
      border: "1px solid #34d399",
      "border-radius": "8px",
      "min-height": "400px",
    };
  }

  updateSrc() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`,
    );
    if (this.isBrowser()) {
      const checkExist = setInterval(() => {
        if (
          this.iframeCodeBlockElement &&
          this.iframeCodeBlockElement.nativeElement
        ) {
          this.iframeCodeBlockElement.nativeElement.textContent =
            this.getIframeHTML();
          setTimeout(() => {
            this.prismService.highlightElement(
              this.iframeCodeBlockElement.nativeElement,
            );
          }, 0);
          clearInterval(checkExist);
        }
      }, 100);
    }
  }

  getIframeHTML() {
    return `<iframe \n src="${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}" \n style="height: ${this.height}; width: ${this.width}; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">\n</iframe>`;
  }
}
