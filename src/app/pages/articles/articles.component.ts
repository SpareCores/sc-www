import { Component, OnInit } from '@angular/core';
import { ArticleMeta, ArticlesService } from '../../services/articles.service';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { ArticleCardComponent } from '../../components/article-card/article-card.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, ArticleCardComponent],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/articles' }
  ];

  articles: ArticleMeta[] = [];

  constructor(
    private SEOHandler: SeoHandlerService,
    private route: ActivatedRoute,
    private articleHandler: ArticlesService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const category = params['tag'];
      this.articleHandler.getArticlesByType(category).then(articles => {
        this.articles = articles;
      });

      this.breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/articles' },

      ];

      const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

      if(category) {
        this.breadcrumbs.push(
          { name: `#${category}`, url: `/articles${category ? '?tag=' + category : '' }` }
        );
      }

      this.SEOHandler.updateTitleAndMetaTags(
        `${title} Articles - SpareCores`, `View all ${title} articles on SpareCores.`,
        (category.length ? category + ' ' : '') + `blog posts, articles, guides, tutorials`
      );

    });

  }
}
