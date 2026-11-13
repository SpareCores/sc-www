import { Injectable, inject } from "@angular/core";
import { EmbedResource } from "../components/embed-dialog/embed-dialog.types";
import {
  decodeBase64JsonUrlState,
  isDatabaseCompareUrlState,
  isServerCompareUrlState,
} from "../tools/encoded-url-state";
import { DatabaseEmbedData } from "./database-embed-data";
import { ServerCompareEmbedData } from "./server-compare-embed-data";
import {
  CompareEmbedModel,
  CompareEmbedResourceConfig,
} from "./compare-embed.types";
import { COMPARE_EMBED_RESOURCES } from "./compare-embed.constants";

@Injectable({ providedIn: "root" })
export class CompareEmbedData {
  private serverCompareEmbedData = inject(ServerCompareEmbedData);
  private databaseEmbedData = inject(DatabaseEmbedData);

  config(resource: EmbedResource): CompareEmbedResourceConfig {
    return COMPARE_EMBED_RESOURCES[resource];
  }

  path(resource: EmbedResource, encodedInstances: string): string {
    return `${this.config(resource).comparePath}?instances=${encodeURIComponent(encodedInstances)}`;
  }

  async load(
    resource: EmbedResource,
    encodedInstances: string,
    widgetId: string,
  ): Promise<CompareEmbedModel | null> {
    const path = this.path(resource, encodedInstances);

    if (resource === "database") {
      const decoded = decodeBase64JsonUrlState(
        encodedInstances,
        isDatabaseCompareUrlState,
      );
      if (!decoded.value) {
        return null;
      }
      return {
        path,
        database: decoded.value.length
          ? await this.databaseEmbedData.loadCompare(decoded.value, widgetId)
          : undefined,
      };
    }

    const decoded = decodeBase64JsonUrlState(
      encodedInstances,
      isServerCompareUrlState,
    );
    if (!decoded.value) {
      return null;
    }
    return {
      path,
      server: decoded.value.length
        ? await this.serverCompareEmbedData.load(decoded.value, widgetId)
        : undefined,
    };
  }
}
