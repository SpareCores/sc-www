import { Component } from "@angular/core";
import { ThemeText } from "../../components/theme-text/theme-text";
import { LucideDynamicIcon, LucideMail } from "@lucide/angular";
import { RouterLink } from "@angular/router";

@Component({
  selector: "sc-footer",
  imports: [ThemeText, LucideDynamicIcon, LucideMail, RouterLink],
  templateUrl: "./footer.html",
  styleUrl: "./footer.scss",
})
export class Footer {
  currentYear = new Date().getFullYear();
}
