import { Component, ElementRef, Inject, PLATFORM_ID, Renderer2, OnInit, ViewChild, OnDestroy, Optional } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { ArticlesService } from '../../services/articles.service';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { REQUEST } from '../../../express.tokens';
import { Request } from 'express';
import * as yaml from 'js-yaml';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [BreadcrumbsComponent, RouterLink, CommonModule, MarkdownModule, TimeToShortDatePipe, LightboxModule, HttpClientModule ],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent implements OnInit, OnDestroy {

  @ViewChild('articleDiv') articleDiv!: ElementRef;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: `/articles` }
  ];

  id!: string;
  articleMeta: any;
  articleBody: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    @Optional()@Inject(REQUEST) private request: Request,
    private route: ActivatedRoute,
    private SEOHandler: SeoHandlerService,
    private markdownService: MarkdownService,
    private domSanitizer: DomSanitizer,
    private articleHandler: ArticlesService,
    private lightbox: Lightbox,
    private renderer: Renderer2,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {

      const id = params['id'];
      this.id = id;
      //this.http.get(`${baseUrl}/assets/articles/${this.id}.md`, { responseType: 'text' } )
      this.articleHandler.getArticle(id)
      //.subscribe(() => {
      .then((file: any) => {

        // Assuming `file` is a string containing your Markdown content...
        const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(file);
        if(match === null) {
          return;
        }
        const data = yaml.load(match[1]);
        const content = file.replace(/---\r?\n[\s\S]+?\r?\n---/, '');

        console.log(data, content);

        //const { data, content } = matter(file);

        this.articleMeta = data;

        this.articleBody = this.domSanitizer.bypassSecurityTrustHtml(
          this.markdownService.parse(content, {disableSanitizer: true}) as string
          );

        this.breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Articles', url: `/articles` },
          { name: this.articleMeta.title, url: `/article/${id}` }
        ];

        this.SEOHandler.updateTitleAndMetaTags(this.articleMeta.title, this.articleMeta.teaser, this.articleMeta.tags.join(","));
        this.generateSchemaJSON();

        if(isPlatformBrowser(this.platformId)) {
          // Wait for the articleDiv to be rendered
          const checkExist = setInterval(() => {
            if (this.articleDiv) {
              this.renderer.listen(this.articleDiv.nativeElement, 'click', (event) => {
                if (event.target.tagName === 'IMG' && event.target.classList[0] == 'zoomin') {
                  this.openLightbox(event.target.src);
                }
              });
              clearInterval(checkExist);
            }
          }, 100);
        }

      });
    });
  }

  ngOnDestroy() {
    this.SEOHandler.cleanupStructuredData(this.document);
  }

  convertToJSON(str: string) {
    const lines = str.split('\n');
    const result: any = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if(key?.length > 0 && value?.length > 0) {
        result[key.trim()] = value;
      }
    }

    return result;
  }

  openLightbox(imgSrc: string) {
    const album = [{
      src: imgSrc,
      thumb: 'image'
   }];
    this.lightbox.open(album, 0);
  }

  generateSchemaJSON() {
    if(!this.articleMeta) {
      return;
    }
    const json = [
        {
            '@context': 'https://schema.org/',
            '@type': 'TechArticle',
            image: [`${this.articleMeta.image}`],
            proficiencyLevel: 'Beginner',
            url: `https://sparecores.com/article/${this.id}`,
            dateCreated: `${this.articleMeta.date}`,
            datePublished: `${this.articleMeta.date}`,
            headline: `${this.articleMeta.teaser}`,
            name: `${this.articleMeta.title}`,
            description: `${this.articleMeta.teaser}`,
            author: {
                '@type': 'Person',
                name: `${this.articleMeta.author}`,
                image: `https://sparecores.com/assets/images/team/${this.articleMeta.author}.webp`,
            },
            creator: {
              '@type': 'Person',
              name: `${this.articleMeta.author}`,
              image: `https://sparecores.com/assets/images/team/${this.articleMeta.author}.webp`,
            },
            publisher: {
                '@type': 'Organization',
                name: 'Spare Cores',
                url: 'https://sparecores.com',
                logo: {
                  '@type': 'ImageObject',
                  width: 800,
                  height: 135,
                  url: 'https://sparecores.com/assets/images/logos/logo_header.png'
                },
            },
            mainEntityOfPage: `https://sparecores.com/article/${this.id}`,
        },
    ];

    this.SEOHandler.setupStructuredData(this.document, [JSON.stringify(json)]);
  }

}
