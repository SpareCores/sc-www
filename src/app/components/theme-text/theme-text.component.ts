import { Component, Input } from "@angular/core";

@Component({
  selector: "app-theme-text",
  templateUrl: "./theme-text.component.html",
  styleUrl: "./theme-text.component.scss",
})
export class ThemeTextComponent {
  @Input() text: string = "";
  @Input() classes: string = "text-lg";
}
