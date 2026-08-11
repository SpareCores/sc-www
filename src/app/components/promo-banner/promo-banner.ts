import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { LucideX } from "@lucide/angular";
import { Button } from "../button/button";

import type { PromoBannerMessage } from "./promo-banner.constants";

@Component({
  selector: "sc-promo-banner",
  imports: [Button, LucideX],
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

  protected dismiss(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dismissed.emit();
  }
}
