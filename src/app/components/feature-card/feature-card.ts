import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Button } from "../button/button";

export type FeatureCardHeadingVariant = "tag" | "bold";

@Component({
  selector: "sc-feature-card",
  imports: [Button],
  templateUrl: "./feature-card.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "relative flex flex-col sc-card sc-card--primary p-4 sm:gap-4 sm:p-8",
  },
})
export class FeatureCard {
  readonly heading = input.required<string>();
  readonly headingVariant = input<FeatureCardHeadingVariant>("bold");
  readonly badge = input<string>();
  readonly actionIcon = input<string>();
  readonly actionLabel = input<string>();
  readonly actionLink = input<string | null>(null);
  readonly actionId = input<string>();

  readonly actionClick = output<void>();
}
