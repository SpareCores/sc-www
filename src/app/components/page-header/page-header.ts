import { Component, input, output } from "@angular/core";
import { LucideDynamicIcon, LucideSquarePen } from "@lucide/angular";
import { PageBookmark } from "../page-bookmark/page-bookmark";
import { ShareLinkButton } from "../share-link-button/share-link-button";

@Component({
  selector: "sc-page-header",
  imports: [PageBookmark, ShareLinkButton, LucideDynamicIcon, LucideSquarePen],
  templateUrl: "./page-header.html",
  styleUrl: "./page-header.css",
})
export class PageHeader {
  icon = input<string | null>(null);
  title = input.required<string>();
  showBookmark = input(false);
  bookmarkActive = input(false);
  bookmarkDisabled = input(false);
  bookmarkLoading = input(false);
  bookmarkGuestLocked = input(false);
  showEdit = input(false);
  editAriaLabel = input("Edit bookmark");
  showShare = input(false);
  shareButtonId = input<string | null>(null);
  actionsFromSm = input(false);
  bookmarkClick = output<MouseEvent>();
  editClick = output<MouseEvent>();
}
