import { Component, input } from "@angular/core";

@Component({
  selector: "sc-author-avatars",
  templateUrl: "./author-avatars.html",
  styleUrl: "./author-avatars.css",
  host: {
    class: "flex shrink-0",
    "[class.flex-col]": "direction() === 'vertical'",
    "[class.vertical]": "direction() === 'vertical'",
    "[class.horizontal]": "direction() === 'horizontal'",
  },
})
export class AuthorAvatars {
  authors = input.required<string[]>();
  direction = input<"horizontal" | "vertical">("horizontal");
}
