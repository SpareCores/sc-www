import { Component, input, output } from "@angular/core";
import { LucideSquarePen } from "@lucide/angular";
import { PageBookmark } from "../page-bookmark/page-bookmark";
import { ShareLinkButton } from "../share-link-button/share-link-button";

@Component({
  selector: "sc-page-actions",
  imports: [PageBookmark, ShareLinkButton, LucideSquarePen],
  templateUrl: "./page-actions.html",
  styleUrl: "./page-actions.css",
})
export class PageActions {
  showBookmark = input(true);
  bookmarkActive = input(false);
  bookmarkDisabled = input(false);
  bookmarkLoading = input(false);
  bookmarkGuestLocked = input(false);
  showEdit = input(false);
  editAriaLabel = input("Edit bookmark");
  shareButtonId = input<string | null>(null);
  bookmarkClick = output<MouseEvent>();
  editClick = output<MouseEvent>();
}
