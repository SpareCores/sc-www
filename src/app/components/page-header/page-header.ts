import { Component, input, output } from "@angular/core";
import {
  LucideBookmark,
  LucideBookmarkOff,
  LucideBookmarkPlus,
  LucideDynamicIcon,
  LucideSquarePen,
} from "@lucide/angular";
import { Button, ScButtonVariant } from "../button/button";

@Component({
  selector: "sc-page-header",
  imports: [
    Button,
    LucideDynamicIcon,
    LucideBookmark,
    LucideBookmarkOff,
    LucideBookmarkPlus,
    LucideSquarePen,
  ],
  templateUrl: "./page-header.html",
  styleUrl: "./page-header.scss",
})
export class PageHeader {
  icon = input.required<string>();
  title = input.required<string>();
  showBookmark = input(false);
  bookmarkActive = input(false);
  bookmarkDisabled = input(false);
  bookmarkLoading = input(false);
  showEdit = input(false);
  editAriaLabel = input("Edit bookmark");
  showShare = input(false);
  shareIcon = input("clipboard");
  shareVariant = input<ScButtonVariant>("outline");
  shareButtonId = input<string | null>(null);
  shareClick = output<MouseEvent>();
  bookmarkClick = output<MouseEvent>();
  editClick = output<MouseEvent>();
}
