import { Component, OnInit, inject, signal } from "@angular/core";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { SeoHandlerService } from "../../services/seo-handler.service";
import {
  PARTNER_CATEGORIES,
  PARTNER_INTEREST_SECTION,
  PARTNERS_PAGE_DESCRIPTION,
  PARTNERS_PAGE_INTRO,
  PARTNERS_PAGE_KEYWORDS,
  PARTNERS_PAGE_TITLE,
} from "./partners.constants";
import { PartnerCategory, PartnerInterestSection } from "./partners.types";

@Component({
  selector: "app-partners",
  imports: [BreadcrumbsComponent],
  templateUrl: "./partners.component.html",
  styleUrl: "./partners.component.scss",
})
export class PartnersComponent implements OnInit {
  private readonly seoHandler = inject(SeoHandlerService);

  readonly pageTitle = PARTNERS_PAGE_TITLE;
  readonly pageDescription = PARTNERS_PAGE_DESCRIPTION;
  readonly pageIntro = PARTNERS_PAGE_INTRO;

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Partners", url: "/partners" },
  ]);

  readonly categories = signal<readonly PartnerCategory[]>(PARTNER_CATEGORIES);
  readonly interestSection = signal<PartnerInterestSection>(
    PARTNER_INTEREST_SECTION,
  );

  getMobileLogoColumns(logoCount: number): string {
    return String(Math.ceil(logoCount / 2));
  }

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      `Spare Cores - ${this.pageTitle}`,
      this.pageDescription,
      PARTNERS_PAGE_KEYWORDS,
    );
  }
}
