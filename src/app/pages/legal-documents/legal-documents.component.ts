import { Component, OnInit, inject } from "@angular/core";
import { ArticlesService, LegalMeta } from "../../services/articles.service";
import { RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date.pipe";

@Component({
  selector: "app-legal-documents",
  imports: [BreadcrumbsComponent, RouterModule, TimeToShortDatePipe],
  templateUrl: "./legal-documents.component.html",
  styleUrl: "./legal-documents.component.scss",
})
export class LegalDocumentsComponent implements OnInit {
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
