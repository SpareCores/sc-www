import { Component, input } from "@angular/core";
import { ServerDescription } from "../../../../sdk/data-contracts";

@Component({
  selector: "sc-server-description-summary",
  templateUrl: "./server-description-summary.html",
  styleUrl: "./server-description-summary.css",
})
export class ServerDescriptionSummary {
  description = input.required<ServerDescription>();
  showHeader = input(false);
}
