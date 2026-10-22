import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { ArticlesApi, SlidesMeta } from "../../services/articles-api";
import { SeoHandler } from "../../services/seo-handler";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date-pipe";
import {
  LucideDynamicIcon,
  LucideHourglass,
  LucideScrollText,
} from "@lucide/angular";

@Component({
  selector: "sc-talks",
  imports: [
    Breadcrumbs,
    RouterModule,
    TimeToShortDatePipe,
    LucideDynamicIcon,
    LucideHourglass,
    LucideScrollText,
  ],
  templateUrl: "./talks.html",
  styleUrl: "./talks.scss",
})
export class Talks implements OnInit {
  private SEOHandler = inject(SeoHandler);
  private route = inject(ActivatedRoute);
  private articles = inject(ArticlesApi);

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Talks", url: "/talks" },
  ];

  talks: SlidesMeta[] = [];

  authorsOf(talk: SlidesMeta): string[] {
    const author = talk.author;
    if (Array.isArray(author)) {
      return author.filter((name) => !!name);
    }
    return author ? [author] : [];
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const category = params["tag"];
      this.articles.getSlides().then((articles) => {
        this.talks = articles;
      });

      if (category) {
        this.breadcrumbs.push({
          name: `#${category}`,
          url: `/articles${category ? "?tag=" + category : ""}`,
        });
      }

      this.SEOHandler.updateTitleAndMetaTags(
        `Conference Talks - Spare Cores`,
        `View all conference talks by the Spare Cores Team.`,
        `conference, talk, presentation, cloud computing, finops, tutorial`,
      );
    });
  }
}
