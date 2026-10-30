import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { ArticleMeta, ArticlesApi } from "../../services/articles-api";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { ActivatedRoute } from "@angular/router";
import { SeoHandler } from "../../services/seo-handler";
import { ArticleCard } from "../../components/article-card/article-card";
import { Subscription } from "rxjs";

@Component({
  selector: "sc-articles",
  imports: [Breadcrumbs, ArticleCard],
  templateUrl: "./articles.html",
  styleUrl: "./articles.css",
})
export class Articles implements OnInit, OnDestroy {
  private SEOHandler = inject(SeoHandler);
  private route = inject(ActivatedRoute);
  private articleHandler = inject(ArticlesApi);

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ];

  articles: ArticleMeta[] = [];
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
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
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
