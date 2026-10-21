import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
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
  templateUrl: "./server-embed-dialog.html",
  styleUrl: "./server-embed-dialog.scss",
})
export class ServerEmbedDialog implements OnChanges, AfterViewInit, OnDestroy {
  private static readonly ASPECT_RATIO = 0.6;
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private SEOHandler = inject(SeoHandlerService);
  private prismService = inject(PrismService);

  @Input() vendor!: string;
  @Input() id!: string;
  @Input() chartname!: string;

  src: any;
  private codeBlockInterval?: ReturnType<typeof setInterval>;

  height = "510px";
  width: string = "100%";

  @Input() charts: EmbedChartOption[] = [];

  @ViewChild("iframeCodeBlock") iframeCodeBlockElement!: ElementRef;
  @ViewChild("myIframe") iframeRef?: ElementRef<HTMLIFrameElement>;

  ngOnChanges() {
    this.updateSrc();
  }

  ngOnDestroy() {
    clearInterval(this.codeBlockInterval);
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
      iframeEl.offsetWidth * ServerEmbedDialog.ASPECT_RATIO + "px";
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
    if (!this.chartname) {
      return;
    }
    const isFirstSrc = !this.src;
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`,
    );
    if (this.isBrowser()) {
      clearInterval(this.codeBlockInterval);
      this.codeBlockInterval = setInterval(() => {
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
          clearInterval(this.codeBlockInterval);
        }
      }, 100);
      if (isFirstSrc) {
        setTimeout(() => this.adjustIframeHeight());
      }
    }
  }

  getIframeHTML() {
    return `<iframe \n src="${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}" \n style="height: ${this.height}; width: ${this.width}; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">\n</iframe>`;
  }
}
