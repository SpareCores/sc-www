import { Component, Input } from "@angular/core";

@Component({
  selector: "sc-theme-text",
  templateUrl: "./theme-text.html",
  styleUrl: "./theme-text.scss",
})
export class ThemeText {
  @Input() text: string = "";
  @Input() classes: string = "text-lg";
}
