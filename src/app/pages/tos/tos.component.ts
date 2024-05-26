import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { DomSanitizer } from '@angular/platform-browser';

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
    { name: 'Term of Service', url: '/legal/tos' }
  ];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private markdownService: MarkdownService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Term of Service', url: `/legal/tos` }
      ];

      this.http.get(`./assets/TOS.md`, { responseType: 'text' }).subscribe((content: any) => {
        this.articleBody = this.domSanitizer.bypassSecurityTrustHtml(this.markdownService.parse(content) as string);
      });

    });
  }

}
