import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as yaml from 'js-yaml';

@Component({
  selector: 'app-tos',
  standalone: true,
  imports: [BreadcrumbsComponent, RouterModule, CommonModule, HttpClientModule, MarkdownModule],
  templateUrl: './tos.component.html',
  styleUrl: './tos.component.scss'
})
export class TOSComponent implements OnInit {

  articleBody: any;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Legal', url: '/legal' }
  ];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private markdownService: MarkdownService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(() => {

      let id = this.route.snapshot.paramMap.get('id');

      this.http.get(`./assets/legal/${id}.md`, { responseType: 'text' }).subscribe((file: any) => {

          // Assuming `file` is a string containing your Markdown content...
          const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(file);
          if(match === null) {
            return;
          }
          const data: any = yaml.load(match[1]);
          const content = file.replace(/---\r?\n[\s\S]+?\r?\n---/, '');

        this.articleBody = this.domSanitizer.bypassSecurityTrustHtml(this.markdownService.parse(content) as string);

        this.breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Legal', url: '/legal' },
          { name: data.title, url: `/legal/${id}` }
        ];
      });

    });
  }

}
