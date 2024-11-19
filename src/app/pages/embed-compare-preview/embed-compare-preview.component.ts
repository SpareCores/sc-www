import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-embed-compare-preview',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './embed-compare-preview.component.html',
  styleUrl: './embed-compare-preview.component.scss'
})
export class EmbedComparePreviewComponent {

  @Input() instances!: string;
  @Input() chartname!: string;
  @Input() isModal!: boolean;

  src: any;

  height = '710px';
  width: string = '100%';

  copyIcon = 'copy';

  @Input() charts = [
    {id: 'bw_mem', name: 'Memory bandwidth' },
    {id: 'compress', name: 'Compression' },
    {id: 'geekbench', name: 'Geekbench Both' },
    {id: 'geekbench_single', name: 'Geekbench SingleCore' },
    {id: 'geekbench_multi', name: 'Geekbench MultiCore' },
    {id: 'openssl', name: 'OpenSSL' },
    {id: 'stress_ng', name: 'Stress-ng div16' },
    {id: 'stress_ng_pct', name: 'Stress-ng relative' },
    {id: 'static_web', name: 'Static web' },
    {id: 'redis', name: 'Redis' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private SEOHandler: SeoHandlerService
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
  }

  getIframeHTML() {
    return `<iframe \n src="${this.SEOHandler.getBaseURL()}/embed/compare/${this.chartname}?instances=${this.instances}" \n style="height: ${this.height}; width: ${this.width}; border: 1px solid #34d399; border-radius: 8px; min-height: 600px">\n</iframe>`;
  }

  ClipboardIframeHTML() {
    const content = this.getIframeHTML();
    navigator.clipboard.writeText(content);

    this.copyIcon = 'check';
    setTimeout(() => {
      this.copyIcon = 'copy';
    }, 2000);
  }

  getCopyIcon() {
    return this.copyIcon;
  }

}
