import { Injectable, inject } from "@angular/core";
import { EmbedResource } from "../components/embed-dialog/embed-dialog.types";
import { DatabaseEmbedData } from "./database-embed-data";
import { DetailsEmbedModel } from "./details-embed.types";
import { ServerEmbedData } from "./server-embed-data";

@Injectable({ providedIn: "root" })
export class DetailsEmbedData {
  private serverEmbedData = inject(ServerEmbedData);
  private databaseEmbedData = inject(DatabaseEmbedData);

  load(
    resource: EmbedResource,
    vendor: string,
    id: string,
    widgetId: string,
  ): Promise<DetailsEmbedModel | null> {
    return resource === "database"
      ? this.databaseEmbedData.loadDetails(vendor, id, widgetId)
      : this.serverEmbedData.load(vendor, id, widgetId);
  }
}
