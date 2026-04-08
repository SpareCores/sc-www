import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { SeoHandlerService } from "../../services/seo-handler.service";

@Component({
  selector: "app-advisor",
  imports: [CommonModule, BreadcrumbsComponent, LucideAngularModule],
  templateUrl: "./advisor.component.html",
  styleUrl: "./advisor.component.scss",
})
export class AdvisorComponent implements OnInit {
  private seoHandler = inject(SeoHandlerService);

  readonly title = "Server Advisor";
  readonly description =
    "Find better cloud server alternatives for a selected baseline server. This page will reuse the server-listing experience while adding advisor-specific recommendation inputs and workload-aware guidance.";

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Advisor", url: "/advisor" },
  ]);

  readonly isCollapsed = signal(false);

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "Server Advisor - Spare Cores",
      "Compare a baseline server against better alternatives with the Spare Cores Server Advisor.",
      "server advisor, cloud servers, recommendation, spare cores",
    );
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
  }
}
