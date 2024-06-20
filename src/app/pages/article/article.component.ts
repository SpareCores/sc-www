import { Component, ElementRef, Inject, PLATFORM_ID, Renderer2, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { ArticlesService } from '../../services/articles.service';
import matter from 'gray-matter';
import { Lightbox, LightboxModule } from 'ngx-lightbox';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [BreadcrumbsComponent, RouterLink, CommonModule, MarkdownModule, TimeToShortDatePipe, LightboxModule ],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent implements OnInit {

  @ViewChild('articleDiv') articleDiv!: ElementRef;

  breadcrumbs: BreadcrumbSegment[] = [

  ];

  articleMeta: any;
  articleBody: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private SEOHandler: SeoHandlerService,
    private markdownService: MarkdownService,
    private domSanitizer: DomSanitizer,
    private articleHandler: ArticlesService,
    private lightbox: Lightbox,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {

      const id = params['id'];
      this.articleHandler.getArticle(id).then((file: any) => {

        const { data, content } = matter(file);

        this.articleMeta = data;
        this.articleBody = this.domSanitizer.bypassSecurityTrustHtml(
          this.markdownService.parse(content, {disableSanitizer: true}) as string);

        this.breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Articles', url: `/articles` },
          { name: this.articleMeta.title, url: `/article/${id}` }
        ];

        this.SEOHandler.updateTitleAndMetaTags(this.articleMeta.title, this.articleMeta.teaser, this.articleMeta.tags.join(","));

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

}
