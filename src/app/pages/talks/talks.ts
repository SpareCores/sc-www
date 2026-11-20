import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { PageHeader } from "../../components/page-header/page-header";
import { ArticlesApi, SlidesMeta } from "../../services/articles-api";
import { SeoHandler } from "../../services/seo-handler";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date-pipe";
import { AuthorAvatars } from "../../components/author-avatars/author-avatars";
import { authorNames } from "../../services/team-members";
import {
  LucideDynamicIcon,
  LucideHourglass,
  LucideScrollText,
} from "@lucide/angular";

@Component({
  selector: "sc-talks",
  imports: [
    Breadcrumbs,
    PageHeader,
    RouterModule,
    TimeToShortDatePipe,
    AuthorAvatars,
    LucideDynamicIcon,
    LucideHourglass,
    LucideScrollText,
  ],
  templateUrl: "./talks.html",
  styleUrl: "./talks.css",
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
    return authorNames(talk.author);
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
