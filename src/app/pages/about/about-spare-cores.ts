import {
  AfterViewInit,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { NeetoCal } from "../../services/neeto-cal";
import { SeoHandler } from "../../services/seo-handler";

@Component({
  selector: "sc-about-spare-cores",
  imports: [Breadcrumbs, RouterLink],
  templateUrl: "./about-spare-cores.html",
  styleUrl: "./about-spare-cores.scss",
})
export class AboutSpareCores implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private SEOHandler = inject(SeoHandler);
  private neetoCalService = inject(NeetoCal);

  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "About",
    },
    {
      name: "Spare Cores",
      url: "/about/spare-cores",
    },
  ];
  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "About Spare Cores",
      "Spare Cores Products and Services overview.",
      "sparecores",
    );
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.neetoCalService.initialize();
    }
  }
}
