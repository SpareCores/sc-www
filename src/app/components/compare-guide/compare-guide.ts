import {
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideChevronRight } from "@lucide/angular";
import { PrismHighlighter } from "../../services/prism-highlighter";
import { HeaderAnchor } from "../header-anchor/header-anchor";
import { CompareGuideItem } from "./compare-guide.types";

@Component({
  selector: "sc-compare-guide",
  imports: [LucideChevronRight, RouterLink, HeaderAnchor],
  templateUrl: "./compare-guide.html",
  styleUrl: "./compare-guide.css",
  host: { class: "block" },
})
export class CompareGuide {
  private prismService = inject(PrismHighlighter);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  compares = input<CompareGuideItem[]>([]);
  comparePath = input.required<string>();
  detailPath = input.required<string>();
  instanceKey = input.required<string>();

  constructor() {
    afterRenderEffect({
      write: () => {
        if (
          this.compares().some((compare) => compare.query) &&
          this.host.nativeElement.querySelector("code")
        ) {
          this.prismService.highlightAll();
        }
      },
    });
  }
}
