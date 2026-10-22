import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "sc-design-page-card",
  templateUrl: "./design-page-card.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignPageCard {
  @Input({ required: true })
  title!: string;
  @Input({ required: true })
  description!: string;
  @Input() headerBgClass: string = "bg-white";
}
