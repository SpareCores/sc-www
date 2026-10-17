import {
  Component,
  Input,
  PLATFORM_ID,
  OnChanges,
  ElementRef,
  ViewChild,
  inject,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PrismService } from "../../services/prism.service";
import { EmbedChartOption } from "./embed-dialog.types";

@Component({
  selector: "sc-compare-embed-dialog",
  imports: [FormsModule],
  templateUrl: "./compare-embed-dialog.component.html",
  styleUrl: "./compare-embed-dialog.component.scss",
})
export class CompareEmbedDialogComponent implements OnChanges {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private SEOHandler = inject(SeoHandlerService);
  private prismService = inject(PrismService);

  @Input() instances!: string;
  @Input() chartname!: string;

  src: any;

  height = "710px";
  width: string = "100%";

  @Input() charts: EmbedChartOption[] = [];

  @ViewChild("iframeCodeBlock") iframeCodeBlockElement!: ElementRef;

  setup() {
    if (this.chartname && this.instances) {
      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.SEOHandler.getBaseURL()}/embed/compare/${this.chartname}?instances=${this.instances}`,
      );
    }
  }

  ngOnChanges() {
    this.updateSrc();
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getStyles() {
    return {
      height: this.height,
      width: this.width,
      border: "1px solid #34d399",
      "border-radius": "8px",
      "min-height": "600px",
    };
  }

  updateSrc() {
    this.setup();
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
    return `<iframe \n src="${this.SEOHandler.getBaseURL()}/embed/compare/${this.chartname}?instances=${this.instances}" \n style="height: ${this.height}; width: ${this.width}; border: 1px solid #34d399; border-radius: 8px; min-height: 600px">\n</iframe>`;
  }
}
