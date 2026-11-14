import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideCheck } from "@lucide/angular";
import { BookmarkButton } from "../bookmark-button/bookmark-button";
import { CompareToggleButton } from "../compare-toggle-button/compare-toggle-button";
import { ScoreGauge } from "../charts/score-gauge/score-gauge";
import { Button } from "../button/button";
import { ShareLink } from "../../services/share-link";
import {
  DetailsHeaderFeature,
  DetailsHeaderScore,
} from "./details-header.types";

@Component({
  selector: "sc-details-header",
  imports: [
    RouterLink,
    LucideCheck,
    BookmarkButton,
    CompareToggleButton,
    ScoreGauge,
    Button,
  ],
  templateUrl: "./details-header.html",
})
export class DetailsHeader {
  private shareLink = inject(ShareLink);

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

  readonly gaugeMax = computed(() => {
    const score = this.score();
    const values = [score?.primaryValue, score?.secondaryValue].filter(
      (value): value is number => value !== null && value !== undefined,
    );
    return values.length ? Math.max(...values) : null;
  });

  share(): void {
    void this.shareLink.copyCurrentUrl();
  }
}
