import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SeoHandler } from "../../services/seo-handler";
import { FUNDING_PROJECTS } from "./funding-information.constants";

@Component({
  selector: "sc-funding-information",
  templateUrl: "./funding-information.html",
  styleUrl: "./funding-information.css",
})
export class FundingInformation implements OnInit {
  private seoHandler = inject(SeoHandler);
  private route = inject(ActivatedRoute);

  readonly project =
    FUNDING_PROJECTS[this.route.snapshot.data["fundingProject"]];

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "NKFIA Tájékoztató",
      "Spare Cores Kft. projekt tájékoztatója az NKFIA támogatásáról",
      "NKFIA, funding, Spare Cores, startup",
    );
  }
}
