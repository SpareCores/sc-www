import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideCheck } from "@lucide/angular";
import { BookmarkButton } from "../bookmark-button/bookmark-button";
import { CompareToggleButton } from "../compare-toggle-button/compare-toggle-button";
import {
  DetailsHeaderFeature,
  DetailsHeaderScore,
} from "./details-header.types";

@Component({
  selector: "sc-details-header",
  imports: [RouterLink, LucideCheck, BookmarkButton, CompareToggleButton],
  templateUrl: "./details-header.html",
})
export class DetailsHeader {
  resource = input.required<"server" | "database">();
  vendorId = input.required<string>();
  vendorName = input.required<string>();
  vendorLogo = input<string | null | undefined>(null);
  entityId = input.required<string>();
  displayName = input.required<string>();
  description = input("");
  priceDescription = input("");
  features = input<DetailsHeaderFeature[]>([]);
  score = input<DetailsHeaderScore | null>(null);
}
