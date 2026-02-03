import { Component, OnInit } from "@angular/core";
import { SeoHandlerService } from "../../services/seo-handler.service";

@Component({
  selector: "app-funding-information",
  templateUrl: "./funding-information.component.html",
  styleUrl: "./funding-information.component.scss",
})
export class FundingInformationComponent implements OnInit {
  constructor(private seoHandler: SeoHandlerService) {}

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "NKFIA Tájékoztató",
      "Spare Cores Kft. projekt tájékoztatója az NKFIA támogatásáról",
      "NKFIA, funding, Spare Cores, startup",
    );
  }
}
