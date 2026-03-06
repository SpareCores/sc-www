import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ArticleMeta, ArticlesService } from "../../services/articles.service";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { ActivatedRoute } from "@angular/router";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ArticleCardComponent } from "../../components/article-card/article-card.component";

@Component({
  selector: "app-articles",
  imports: [BreadcrumbsComponent, ArticleCardComponent],
  templateUrl: "./articles.component.html",
  styleUrl: "./articles.component.scss",
})
export class ArticlesComponent implements OnInit {
  private SEOHandler = inject(SeoHandlerService);
  private route = inject(ActivatedRoute);
  private articleHandler = inject(ArticlesService);
  private destroyRef = inject(DestroyRef);

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ];

  articles: ArticleMeta[] = [];

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const category = params["tag"];
        this.articleHandler.getArticlesByType(category).then((articles) => {
          this.articles = articles;
        });

        this.breadcrumbs = [
          { name: "Home", url: "/" },
          { name: "Articles", url: "/articles" },
        ];

        const title = category
          ? category.charAt(0).toUpperCase() + category.slice(1)
          : "";

        if (category) {
          this.breadcrumbs.push({
            name: `#${category}`,
            url: `/articles`,
            queryParams: { tag: category },
          });
        }

        this.SEOHandler.updateTitleAndMetaTags(
          `${title} Articles - SpareCores`,
          `View all ${title} articles on SpareCores.`,
          (category?.length ? category + " " : "") +
            `blog posts, articles, guides, tutorials`,
        );
      });
  }
}
