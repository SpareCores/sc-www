import { Component, OnInit, inject } from "@angular/core";
import { ArticlesService, LegalMeta } from "../../services/articles.service";
import { RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date.pipe";

@Component({
  selector: "sc-legal-documents",
  imports: [Breadcrumbs, RouterModule, TimeToShortDatePipe],
  templateUrl: "./legal-documents.html",
  styleUrl: "./legal-documents.scss",
})
export class LegalDocuments implements OnInit {
  private SEOHandler = inject(SeoHandlerService);
  private articles = inject(ArticlesService);

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/legal" },
  ];

  docs: LegalMeta[] = [];

  ngOnInit() {
    this.articles.getLegalDocuments().then((articles) => {
      this.docs = articles;
    });

    this.SEOHandler.updateTitleAndMetaTags(
      `Legal Documents - Spare Cores`,
      `List of Legal documents.`,
      `ToS, legal, privacy policy, terms of service`,
    );
  }
}
