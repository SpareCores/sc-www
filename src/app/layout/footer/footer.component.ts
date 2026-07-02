import { Component } from "@angular/core";
import { ThemeTextComponent } from "../../components/theme-text/theme-text.component";

import { RouterLink } from "@angular/router";
import { Icon } from "../../components/icon/icon.js";

@Component({
  selector: "app-footer",
  imports: [ThemeTextComponent, RouterLink, Icon],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
