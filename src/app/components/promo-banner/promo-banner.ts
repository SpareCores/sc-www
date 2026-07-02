import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import type { PromoBannerMessage } from "./promo-banner.constants";
import { Icon } from "../icon/icon.js";

@Component({
  selector: "app-promo-banner",
  imports: [RouterLink, Icon],
  templateUrl: "./promo-banner.html",
  styleUrl: "./promo-banner.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
})
export class PromoBanner {
  readonly message = input.required<PromoBannerMessage>();
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected readonly isAdvisorBanner = computed(
    () => this.message().variant === "advisor",
  );

  protected dismiss(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dismissed.emit();
  }
}
