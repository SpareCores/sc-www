import { Component, OnInit, inject } from "@angular/core";
import { SeoHandler } from "../../services/seo-handler";

@Component({
  selector: "sc-funding-information",
  templateUrl: "./funding-information.html",
  styleUrl: "./funding-information.css",
})
export class FundingInformation implements OnInit {
  private seoHandler = inject(SeoHandler);

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "NKFIA Tájékoztató",
      "Spare Cores Kft. projekt tájékoztatója az NKFIA támogatásáról",
      "NKFIA, funding, Spare Cores, startup",
    );
  }
}
