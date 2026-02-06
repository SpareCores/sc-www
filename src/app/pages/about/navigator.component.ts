import {
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  OnInit,
  inject,
} from "@angular/core";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { ThemeTextComponent } from "../../components/theme-text/theme-text.component";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { NeetoCalService } from "../../services/neeto-cal.service";

interface Quote {
  quote: string;
  author: string;
  source: string;
  source_url?: string;
  consent_to_publish?: boolean;
}

@Component({
  selector: "app-about-navigator",
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    ThemeTextComponent,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./navigator.component.html",
  styleUrl: "./navigator.component.scss",
})
export class AboutNavigatorComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private SEOHandler = inject(SeoHandlerService);
  private neetoCalService = inject(NeetoCalService);

  vendors: any[] = [
    "✅ Amazon Web Services (Done)",
    "✅ Google Cloud Platform (Done)",
    "✅ Hetzner Cloud (Done)",
    "✅ Microsoft Azure (Done)",
    "✅ UpCloud (Done)",
    "✅ OVH Cloud (Done)",
    "✅ Alibaba Cloud (Done)",
    "⚙️ Oracle Cloud Infrastructure (In Progress)",
    "🗓️ Vultr (Planned)",
    "🗓️ Scaleway (Planned)",
  ];

  features: any[] = [
    {
      count: "522",
      text: "availability zones",
    },
    {
      count: "4,984",
      text: "server types",
    },
    {
      count: "1,342,689",
      text: "benchmark scores",
    },
    {
      count: "467,693",
      text: "live price records",
    },
    {
      count: "~5k",
      text: "records updated hourly",
    },

    {
      count: "100M+", // 68M from server_price_scd_20250701
      text: "historical records",
    },
  ];

  quotes: Quote[] = [
    {
      quote:
        "This is super cool. The folks at @SpareCores built something that compares compute, storage, and transit across multiple providers, creating more transparency into cloud infra pricing. 💯",
      author: "Mike Julian, CEO @ The Duckbill Group",
      source: "Twitter/X",
      source_url: "https://x.com/mike_julian/status/1845555820635066462",
      consent_to_publish: true, // public post
    },
    {
      quote:
        "Spare Cores is straight-up crushing it! 💥 Turning a €150K grant into a killer cloud price tool with just 3 people? That’s some big-brain, lean-team energy. Props to this squad for making it happen! 👏",
      author: "Simone Nogara, Cloud Architect @ European Commission",
      source: "LinkedIn",
      source_url:
        "https://www.linkedin.com/feed/update/urn:li:activity:7253413263399432192?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7253413263399432192%2C7253428631543173120%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287253428631543173120%2Curn%3Ali%3Aactivity%3A7253413263399432192%29",
      consent_to_publish: true, // public post
    },
    {
      quote:
        "Thanks for publishing all the instance information! I had wanted to try and pull together the trends of vCPU vs local storage size, but manually digging up instance information on websites was an absurd hassle. Now it's a SQL query!",
      author: "Database Internals Engineer (ex Google, Apple, Snowflake)",
      source: "email",
      consent_to_publish: true, // July 21, 2025
    },
    {
      quote:
        "I really liked the idea of Spare Cores because pricing comparison across cloud providers is increasingly useful.",
      author: "Gergely Orosz @ The Pragmatic Engineer",
      source: "The Pulse newsletter",
      source_url: "https://blog.pragmaticengineer.com/spare-cores/",
      consent_to_publish: true, // public post
    },
    {
      quote:
        "Honestly, you’re doing something the industry has been missing for too long—and doing it brilliantly.",
      author: "FinOps Engineer",
      source: "email",
      consent_to_publish: true, // July 19, 2025
    },
    {
      quote:
        "I'm impressed by what a useful tool this tiny team built purely from a modest EU grant.",
      author: "Gergely Orosz @ The Pragmatic Engineer",
      source: "The Pulse newsletter",
      source_url: "https://blog.pragmaticengineer.com/spare-cores/",
      consent_to_publish: true, // public post
    },
  ];
  get publishableQuotes(): Quote[] {
    return this.quotes.filter((quote) => quote.consent_to_publish === true);
  }

  gitHubComponents: any[] = [
    {
      component: "SC Crawler",
      status: "Beta",
      github: "sc-crawler",
      pypi: "sparecores-crawler",
      docs: "https://sparecores.github.io/sc-crawler",
      description: "Inventory cloud resources into a SQlite database.",
    },
    {
      component: "SC Inspector",
      status: "Beta",
      description: "Inspect and benchmark cloud resources.",
      github: "sc-inspector",
      data: "https://github.com/SpareCores/sc-inspector-data",
    },
    {
      component: "SC Data",
      status: "Beta",
      github: "sc-data",
      pypi: "sparecores-data",
      description: "Wrapper around data collected using the Crawler.",
      data: "https://sc-data-public-40e9d310.s3.amazonaws.com/sc-data-all.db.bz2",
    },
    {
      component: "SC Keeper",
      status: "Alpha",
      description: "API to search the Data.",
      github: "sc-keeper",
      docs: "https://keeper.sparecores.net/docs",
      api: "https://keeper.sparecores.net",
    },
    {
      component: "SC Scanner",
      status: "Stable",
      description: "Web frontend and programming language SDKs for Keeper.",
      www: "https://github.com/SpareCores/sc-www",
    },
    {
      component: "SC Runner",
      status: "Beta",
      description: "Launching actual cloud instances.",
      github: "sc-runner",
    },
  ];

  @ViewChild("tooltipVendors") tooltip!: ElementRef;
  @ViewChild("testimonialsSwiper") testimonialsSwiper?: ElementRef;

  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "About",
    },
    {
      name: "Navigator",
      url: "/about/navigator",
    },
  ];

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Spare Cores Navigator: Open-Source Cloud Server Benchmarks and Pricing Data",
      "Open-source Python framework and managed platform providing the most detailed, transparent, and up-to-date public dataset on cloud servers.",
      "cloud, server, price, comparison, sparecores, navigator",
    );
    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/media/landing_navigator.png",
    );
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // initialize neetoCal
      this.neetoCalService.initialize();
      // initialize Swiper
      setTimeout(() => {
        const swiperElements = document.querySelectorAll(
          'swiper-container[init="false"]',
        );
        swiperElements.forEach((swiperEl) => {
          (swiperEl as any).initialize();
        });
      }, 0);
    }
  }

  showTooltip(el: any) {
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
  }
  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }
}
