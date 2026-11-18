import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HeaderAnchor } from "../header-anchor/header-anchor";

@Component({
  selector: "sc-section-heading",
  imports: [HeaderAnchor],
  templateUrl: "./section-heading.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex flex-col gap-4 text-center sm:gap-8",
  },
})
export class SectionHeading {
  readonly tag = input.required<string>();
  readonly attrName = input<string>();
  readonly attrValue = input<string>();
  readonly subtitle = input<string>();
  readonly anchorId = input<string>();
  readonly anchorLabel = input("");
}
