import { Component, computed, inject, input } from "@angular/core";
import { SeoHandler } from "../../services/seo-handler";
import { EmbedChartOption } from "./embed-dialog.types";
import { EmbedDialog } from "./embed-dialog";

@Component({
  selector: "sc-compare-embed-dialog",
  imports: [EmbedDialog],
  templateUrl: "./compare-embed-dialog.html",
})
export class CompareEmbedDialog {
  private SEOHandler = inject(SeoHandler);

  instances = input.required<string>();
  charts = input<EmbedChartOption[]>([]);

  srcFor = computed(() => {
    const base = `${this.SEOHandler.getBaseURL()}/embed/compare`;
    const instances = this.instances();
    return (chartId: string) => `${base}/${chartId}?instances=${instances}`;
  });
}
