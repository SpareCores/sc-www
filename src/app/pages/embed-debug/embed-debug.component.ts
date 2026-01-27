import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { LucideAngularModule } from "lucide-angular";
import { PrismService } from "../../services/prism.service";
@Component({
  selector: "app-embed-debug",
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: "./embed-debug.component.html",
  styleUrl: "./embed-debug.component.scss",
})
export class EmbedDebugComponent implements OnInit, OnChanges {
  @Input() vendor!: string;
  @Input() id!: string;
  @Input() chartname!: string;
  @Input() isModal!: boolean;

  src: any;

  height = "510px";
  width: string = "100%";

  @Input() charts = [
    { id: "bw_mem", name: "Memory Bandwidth" },
    { id: "compress", name: "Compression" },
    { id: "geek_single", name: "Geekbench Single-core" },
    { id: "geek_multi", name: "Geekbench Multi-core" },
    { id: "ssl", name: "OpenSSL" },
    { id: "stress_ng_div16", name: "Stress-ng div16" },
    { id: "stress_ng_relative", name: "Stress-ng Relative" },
    { id: "llm_inference", name: "LLM Inference" },
    { id: "static_web", name: "Static Web Server" },
    { id: "redis", name: "Redis" },
  ];

  @ViewChild("iframeCodeBlock") iframeCodeBlockElement!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private SEOHandler: SeoHandlerService,
    private prismService: PrismService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.vendor = params["vendor"];
      this.id = params["id"];
      this.chartname = params["chartname"];

      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`,
      );
    });
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
