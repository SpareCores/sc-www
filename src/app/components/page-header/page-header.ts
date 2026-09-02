import { Component, input, output } from "@angular/core";
import { LucideDynamicIcon, LucideStar } from "@lucide/angular";
import { Button, ScButtonVariant } from "../button/button";

@Component({
  selector: "sc-page-header",
  imports: [Button, LucideDynamicIcon, LucideStar],
  templateUrl: "./page-header.html",
  styleUrl: "./page-header.scss",
})
export class PageHeader {
  icon = input.required<string>();
  title = input.required<string>();
  showSavedStar = input(false);
  showShare = input(false);
  shareIcon = input("clipboard");
  shareVariant = input<ScButtonVariant>("outline");
  shareButtonId = input<string | null>(null);
  shareClick = output<MouseEvent>();
}
