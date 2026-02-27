import { Component, inject, OnInit, signal } from "@angular/core";
import {
  BreadcrumbsComponent,
  BreadcrumbSegment,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { SeoHandlerService } from "../../services/seo-handler.service";

@Component({
  selector: "app-benchmark-workloads",
  imports: [BreadcrumbsComponent, LucideAngularModule],
  templateUrl: "./benchmark-workloads.component.html",
  styleUrl: "./benchmark-workloads.component.scss",
})
export class BenchmarkWorkloadsComponent implements OnInit {
  pageTitle = "Benchmark Workloads";
  pageDescription = "Description of Benchmark Workloads";

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Navigator", url: "/about/navigator" },
    { name: "Benchmark Workloads", url: "/navigator/benchmark-workloads" },
  ]);
  seoHandler = inject(SeoHandlerService);

  ngOnInit() {
    this.seoHandler.updateTitleAndMetaTags(
      "Spare Cores - Benchmark Workloads",
      "SEO Text 1",
      "SEO Text 2",
    );
    this.seoHandler.updateThumbnail("OG Image URL");
  }
}
