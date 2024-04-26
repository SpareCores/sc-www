import { Component } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [BreadcrumbsComponent, RouterModule, CommonModule, HttpClientModule, MarkdownModule, TimeToShortDatePipe],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Article', url: '/article/1' }
  ];

  articleMeta: any;
  articleBody: any;

  html: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private markdownService: MarkdownService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
      this.breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Article', url: `/article/${params['category']}/${params['id']}` }
      ];

      this.http.get(`./assets/articles/${params['category']}/${params['id']}.md`, { responseType: 'text' }).subscribe((content: any) => {
        console.log(content);
        this.articleMeta = this.convertToJSON(content.split('---')[1]);
        console.log('meta', this.articleMeta);
        // article boday is the content after the second '---'
        this.articleBody = content.split('---')[2];
        console.log('content', this.articleBody);
        this.html = this.domSanitizer.bypassSecurityTrustHtml(this.markdownService.parse(this.articleBody) as string);
        console.log('html', this.html);

      });

    });
  }

  convertToJSON(str: string) {
    const lines = str.split('\n');
    const result: any = {};

    for (let line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if(key?.length > 0 && value?.length > 0) {
        result[key.trim()] = value;
      }
    }

    return result;
  }

}
