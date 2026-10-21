import { Component, OnInit, inject } from "@angular/core";
import { SeoHandlerService } from "../../services/seo-handler.service";

@Component({
  selector: "sc-funding-information",
  templateUrl: "./funding-information.html",
  styleUrl: "./funding-information.scss",
})
export class FundingInformation implements OnInit {
  private seoHandler = inject(SeoHandlerService);

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "NKFIA Tájékoztató",
      "Spare Cores Kft. projekt tájékoztatója az NKFIA támogatásáról",
      "NKFIA, funding, Spare Cores, startup",
    );
  }
}
