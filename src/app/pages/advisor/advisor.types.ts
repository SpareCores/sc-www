import { Server, ServerPKs } from "../../../../sdk/data-contracts";
import { SearchBarServerOption } from "../../components/search-bar/search-bar.component";

export type AdvisorTableColumn = {
  name: string;
  key: keyof ServerPKs | "details";
  orderField?: string;
};

export type AdvisorBaselineServer = SearchBarServerOption &
  Partial<Pick<Server, "status">>;

export type AdvisorSeoMetadata = {
  title: string;
  description: string;
  keywords: string;
};

export type AdvisorSummaryAlert = {
  tone: "positive" | "neutral";
  title: string;
  body: string;
};
