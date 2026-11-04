import { Component, computed, inject, input } from "@angular/core";
import { SeoHandler } from "../../services/seo-handler";
import { EmbedChartOption } from "./embed-dialog.types";
import { EmbedDialog } from "./embed-dialog";

@Component({
  selector: "sc-server-embed-dialog",
  imports: [EmbedDialog],
  templateUrl: "./server-embed-dialog.html",
})
export class ServerEmbedDialog {
  private SEOHandler = inject(SeoHandler);

  vendor = input.required<string>();
  id = input.required<string>();
  charts = input<EmbedChartOption[]>([]);

  srcFor = computed(() => {
    const base = `${this.SEOHandler.getBaseURL()}/embed/server/${this.vendor()}/${this.id()}`;
    return (chartId: string) => `${base}/${chartId}`;
  });
}
