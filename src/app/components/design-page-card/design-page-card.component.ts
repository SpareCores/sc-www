import { CommonModule } from "@angular/common";
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-design-page-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./design-page-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignPageCardComponent {
  @Input({ required: true })
  title!: string;
  @Input({ required: true })
  description!: string;
  @Input() headerBgClass: string = "bg-white";
}
