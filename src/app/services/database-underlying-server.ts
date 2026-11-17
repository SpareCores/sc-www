import { Injectable, inject } from "@angular/core";
import { Database } from "../../../sdk/data-contracts";
import { PgbenchScore } from "../components/charts/line/benchmark-line-chart.types";
import { LoadedUnderlyingServer } from "./database-spec-cards.types";
import { KeeperAPI } from "./keeper-api";

@Injectable({ providedIn: "root" })
export class DatabaseUnderlyingServer {
  private keeperAPI = inject(KeeperAPI);

  async load(
    database: Pick<Database, "vendor_id" | "server_id">,
    withScores: boolean,
  ): Promise<LoadedUnderlyingServer> {
    if (!database.server_id) {
      return { scores: [] };
    }

    try {
      const [serverResponse, scores] = await Promise.all([
        this.keeperAPI.getServerV2(database.vendor_id, database.server_id),
        withScores
          ? this.loadScores(database.vendor_id, database.server_id)
          : Promise.resolve([] as PgbenchScore[]),
      ]);
      const server = serverResponse?.body;
      if (!server?.display_name || !server?.api_reference) {
        return { scores };
      }

      return {
        server: {
          display_name: server.display_name,
          api_reference: server.api_reference,
          cpu_cores: server.cpu_cores,
          vcpus: server.vcpus,
        },
        scores,
      };
    } catch {
      return { scores: [] };
    }
  }

  private loadScores(vendorId: string, serverId: string) {
    return this.keeperAPI
      .getServerBenchmark(vendorId, serverId)
      .then((response) => (response?.body || []) as PgbenchScore[])
      .catch(() => [] as PgbenchScore[]);
  }
}
