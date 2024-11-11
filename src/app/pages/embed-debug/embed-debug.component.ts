import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-embed-debug',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './embed-debug.component.html',
  styleUrl: './embed-debug.component.scss'
})
export class EmbedDebugComponent implements OnInit, OnChanges {

  @Input() vendor!: string;
  @Input() id!: string;
  @Input() chartname!: string;
  @Input() isModal!: boolean;

  src: any;

  height = '510px';
  width: string = '100%';

  copyIcon = 'copy';

  @Input() charts = [
    {id: 'bw_mem', name: 'Memory bandwidth' },
    {id: 'compress', name: 'Compression' },
    {id: 'geek_single', name: 'Geekbench single core' },
    {id: 'geek_multi', name: 'Geekbench multi core' },
    {id: 'ssl', name: 'SSL' },
    {id: 'stress_ng_div16', name: 'Stress-ng div16' },
    {id: 'stress_ng_relative', name: 'Stress-ng relative' },
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
      this.vendor = params['vendor'];
      this.id = params['id'];
      this.chartname = params['chartname'];

      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`);
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
      'height': this.height,
      'width': this.width,
      'border': '1px solid #34d399',
      'border-radius': '8px',
      'min-height': '400px'
    };
  }

  updateSrc() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`);
  }

  getIframeHTML() {
    return `<iframe \n src="${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}" \n style="height: ${this.height}; width: ${this.width}; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">\n</iframe>`;
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
