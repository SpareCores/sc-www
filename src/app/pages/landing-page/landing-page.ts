import {
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  PLATFORM_ID,
  OnInit,
  ViewChild,
  ElementRef,
  afterNextRender,
  inject,
} from "@angular/core";
import { ArticleMeta, ArticlesApi } from "../../services/articles-api";
import { isPlatformBrowser } from "@angular/common";
import { SeoHandler } from "../../services/seo-handler";
import { SectionHeading } from "../../components/section-heading/section-heading";
import { Button } from "../../components/button/button";
import { SlotMachine } from "../../components/slot-machine/slot-machine";
import { RouterLink } from "@angular/router";
import {
  LucideCheck,
  LucideMessageSquareMore,
  LucideQuote,
  LucideRocket,
  LucideScanEye,
  LucideSquareArrowDown,
  LucideSquareArrowUpRight,
} from "@lucide/angular";
import { ArticleCard } from "../../components/article-card/article-card";
import { NeetoCal } from "../../services/neeto-cal";
import { PrismHighlighter } from "../../services/prism-highlighter";

@Component({
  selector: "sc-landingpage",
  imports: [
    SectionHeading,
    Button,
    SlotMachine,
    RouterLink,
    LucideCheck,
    LucideMessageSquareMore,
    LucideQuote,
    LucideRocket,
    LucideScanEye,
    LucideSquareArrowDown,
    LucideSquareArrowUpRight,
    ArticleCard,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./landing-page.html",
  styleUrl: "./landing-page.css",
})
export class LandingPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private SEOHandler = inject(SeoHandler);
  private articles = inject(ArticlesApi);
  private neetoCalService = inject(NeetoCal);
  private prismService = inject(PrismHighlighter);
  private cdr = inject(ChangeDetectorRef);

  showResourceTrackerCode = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.showResourceTrackerCode = true;
      this.cdr.detectChanges();
      this.prismService.highlightAll();
      this.neetoCalService.initialize();
    });
  }

  featuredArticles: ArticleMeta[] = [];

  @ViewChild("tooltipVendors") tooltip!: ElementRef;

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Spare Cores: Run DS/ML/AI Workloads Faster, Cheaper, and with Less Hassle",
      "Help you auto-track resource usage and optimize allocations on optimal cloud servers.",
      "data science, machine learning, batch workloads, cloud, server, price, comparison, sparecores",
    );

    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/og/landing.png",
    );

    if (isPlatformBrowser(this.platformId)) {
      this.articles.getArticlesByType("featured").then((articles) => {
        this.featuredArticles = articles;
      });
    }
  }

  toggleQuote(event: Event) {
    const clickedElement = event.currentTarget as HTMLElement;
    const quoteContainer = clickedElement.closest(".quote-container");
    if (quoteContainer) {
      const preview = quoteContainer.querySelector(".quote-preview");
      const full = quoteContainer.querySelector(".quote-full");
      if (preview && full) {
        preview.classList.toggle("hidden");
        full.classList.toggle("hidden");
      }
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}
