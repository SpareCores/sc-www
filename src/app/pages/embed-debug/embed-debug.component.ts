import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-embed-debug',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './embed-debug.component.html',
  styleUrl: './embed-debug.component.scss'
})
export class EmbedDebugComponent {

  @Input() vendor!: string;
  @Input() id!: string;
  @Input() chartname!: string;
  @Input() isModal!: boolean;

  src: any;

  height = '510px';
  width: string = '100%';

  charts = [
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
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private SEOHandler: SeoHandlerService
  ) { }

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

  getStyles() {
    return {
      'height': this.height,
      'width': this.width,
      'border': '1px solid #34d399',
      'border-radius': '8px',
    };
  }

  updateSrc() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor}/${this.id}/${this.chartname}`);
  }

  ClipboardIframeHTML() {
    const content =
    `<iframe src="https://sparecores.com/embed/server/${this.vendor}/${this.id}/${this.chartname}" style="height: ${this.height}; width: ${this.width}; boder: 1px solid #34d399; border-radius: 8px"></iframe>`;
    navigator.clipboard.writeText(content);
  }

}
