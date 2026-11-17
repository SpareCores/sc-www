import { Component, computed, inject, input } from "@angular/core";
import { LucideExternalLink } from "@lucide/angular";
import { SeoHandler } from "../../services/seo-handler";

@Component({
  selector: "sc-embed-frame",
  imports: [LucideExternalLink],
  templateUrl: "./embed-frame.html",
  styleUrl: "./embed-frame.css",
})
export class EmbedFrame {
  private SEOHandler = inject(SeoHandler);

  path = input<string | null>(null);
  linkLabel = input("");
  footerTone = input<"primary" | "secondary">("primary");

  readonly href = computed(() => {
    const path = this.path();
    return path ? `${this.SEOHandler.getBaseURL()}${path}` : null;
  });
}
