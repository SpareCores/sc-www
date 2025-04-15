import { Component, Inject, Input, PLATFORM_ID, OnInit, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PrismService } from '../../services/prism.service';

interface ChartOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-embed-compare-preview',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './embed-compare-preview.component.html',
  styleUrl: './embed-compare-preview.component.scss'
})
export class EmbedComparePreviewComponent implements OnInit, OnChanges {

  @Input() instances!: string;
  @Input() chartname!: string;
  @Input() isModal!: boolean;

  src: any;

  height = '710px';
  width: string = '100%';

  @Input() charts: ChartOption[] = [
    {id: 'bw_mem', name: 'Memory Bandwidth' },
    {id: 'compress', name: 'Compression' },
    {id: 'geekbench', name: 'Geekbench Single- and Multi-core' },
    {id: 'geekbench_single', name: 'Geekbench Single-core' },
    {id: 'geekbench_multi', name: 'Geekbench Multi-core' },
    {id: 'openssl', name: 'OpenSSL' },
    {id: 'stress_ng', name: 'Stress-ng div16' },
    {id: 'stress_ng_pct', name: 'Stress-ng Relative' },
    {id: 'llm_inference', name: 'LLM Inference' },
    {id: 'static_web', name: 'Static Web Server' },
    {id: 'redis', name: 'Redis' }
  ];

  @ViewChild('iframeCodeBlock') iframeCodeBlockElement!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private SEOHandler: SeoHandlerService,
    private prismService: PrismService
  ) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chartname = params['chartname'] || this.chartname;
      this.setup();
    });

    this.route.queryParams.subscribe(params => {
      this.instances = params['instances'] || this.instances;
      this.setup();
    });
  }

  setup() {
    if(this.chartname && this.instances) {
      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.SEOHandler.getBaseURL()}/embed/compare/${this.chartname}?instances=${this.instances}`);
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
      'height': this.height,
      'width': this.width,
      'border': '1px solid #34d399',
      'border-radius': '8px',
      'min-height': '600px'
    };
  }

  updateSrc() {
    this.setup();
    if (this.isBrowser()) {
      const checkExist = setInterval(() => {
        if (this.iframeCodeBlockElement && this.iframeCodeBlockElement.nativeElement) {
          this.iframeCodeBlockElement.nativeElement.textContent = this.getIframeHTML();
          setTimeout(() => {
            this.prismService.highlightElement(this.iframeCodeBlockElement.nativeElement);
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
