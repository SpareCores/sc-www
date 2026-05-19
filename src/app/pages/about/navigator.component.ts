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
import { UiTooltipService } from "../../services/ui-tooltip.service";

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
  private uiTooltip = inject(UiTooltipService);

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
      count: "540",
      text: "availability zones",
    },
    {
      count: "5,550",
      text: "server types",
    },
    {
      count: "2,250,285",
      text: "benchmark scores",
    },
    {
      count: "542,771",
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
      component: "Runner",
      status: "Stable",
      description: "Pulumi wrapper to launch instances across clouds.",
      github: "sc-runner",
      pypi: "sparecores-runner",
      license: "MPL 2.0",
    },
    {
      component: "Inspector",
      status: "Stable",
      description: "Python tools to inspect and benchmark cloud servers.",
      github: "sc-inspector",
      license: "MPL 2.0",
    },
    {
      component: "Inspector Data",
      status: "Stable",
      description: "Raw hardware information and benchmark results.",
      github: "sc-inspector-data",
      license: "CC BY-SA 4.0",
    },
    {
      component: "Crawler",
      status: "Stable",
      github: "sc-crawler",
      license: "MPL 2.0",
      pypi: "sparecores-crawler",
      docs: "https://sparecores.github.io/sc-crawler",
      description: "Cloud vendor API and Inspector Data integrations.",
    },
    {
      component: "Crawler Data",
      status: "Stable",
      github: "sc-data-dumps",
      license: "CC BY-SA 4.0",
      description: "JSON dumps of collected cloud resource information.",
    },
    {
      component: "Database",
      status: "Stable",
      data: "https://cdn.sparecores.net/sc-data/sc-data-all.sql.xz",
      license: "BSL 1.1",
      description: "SQLite database dump of current cloud resource information.",
    },
    {
      component: "Data Wrapper",
      status: "Stable",
      github: "sc-data",
      license: "MPL 2.0",
      pypi: "sparecores-data",
      description: "Python package for easy integration of the Database.",
    },
    {
      component: "HTTP API",
      status: "Stable",
      description: "Programmatic access to the Database.",
      github: "sc-keeper",
      license: "MPL 2.0",
      docs: "https://keeper.sparecores.net/docs",
      api: "https://keeper.sparecores.net",
    },
    {
      component: "Web UI",
      status: "Stable",
      github: "https://github.com/SpareCores/sc-www",
      license: "MPL 2.0",
      description: "Web frontend for human access to the Database.",
      www: "https://sparecores.com/servers",
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
      "https://sparecores.com/assets/images/og/landing_navigator.png",
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
    this.uiTooltip.show(tooltip, el, {
      left: "anchor-right",
      top: "anchor-above",
    });
  }
  hideTooltip() {
    this.uiTooltip.hide(this.tooltip.nativeElement);
  }
}
