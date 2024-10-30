import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-embed-debug',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './embed-debug.component.html',
  styleUrl: './embed-debug.component.scss'
})
export class EmbedDebugComponent {

  vendor!: string;
  id!: string;
  chartname!: string;

  src: any;

  height = '510px';
  width: string = '100%';

  charts = [
    'bw_mem',
    'compress',
    'geek_single',
    'geek_multi',
    'ssl',
    'stress_ng_div16',
    'stress_ng_relative',
    'static_web',
    'redis'
  ];

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
      this.vendor = params['vendor'];
      this.id = params['id'];
      this.chartname = params['chartname'];

      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:4200/embed/server/${this.vendor}/${this.id}/${this.chartname}`);

    })
  }

  getStyles() {
    return {
      'height': this.height,
      'width': this.width
    };
  }

  updateSrc() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:4200/embed/server/${this.vendor}/${this.id}/${this.chartname}`);
  }

  ClipboardIframeHTML() {
    const content = `<iframe src="https://sparecores.com/embed/server/${this.vendor}/${this.id}/${this.chartname}" style="height: ${this.height}; width: ${this.width}"></iframe>`;
    navigator.clipboard.writeText(content);
  }


}
