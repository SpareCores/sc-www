import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HeaderAnchor } from "../header-anchor/header-anchor";

export type SectionHeadingDescription = "body" | "lead" | "compact";

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
  readonly monoTitle = input(false);
  readonly wideTitleGap = input(false);
  readonly subtitle = input<string>();
  readonly fullWidthSubtitle = input(false);
  readonly description = input<SectionHeadingDescription>("body");
  readonly monoDescription = input(false);
  readonly anchorId = input<string>();
  readonly anchorLabel = input("");
  readonly anchorWithTarget = input(false);
}
