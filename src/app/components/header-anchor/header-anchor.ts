import { Component, inject, input } from "@angular/core";
import { HeaderAnchorLink } from "../../services/header-anchor-link";

@Component({
  selector: "sc-header-anchor",
  templateUrl: "./header-anchor.html",
})
export class HeaderAnchor {
  protected readonly anchorLink = inject(HeaderAnchorLink);

  readonly anchorId = input.required<string>();
  readonly label = input.required<string>();
  readonly withTarget = input(true);
}
