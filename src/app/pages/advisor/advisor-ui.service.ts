import { Injectable } from "@angular/core";
import { ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE } from "./advisor.copy";
import { AdvisorBaselineServer, AdvisorSummaryAlert } from "./advisor.types";
import { matchesAdvisorBaselineServer } from "./advisor.utils";

@Injectable({
  providedIn: "root",
})
export class AdvisorUiService {
  filterBaselineServers(
    servers: AdvisorBaselineServer[],
    searchValue: string,
    minCharacters = 3,
    limit = 20,
  ): AdvisorBaselineServer[] {
    if (searchValue.trim().length < minCharacters) {
      return [];
    }

    return servers
      .filter((server) => matchesAdvisorBaselineServer(server, searchValue))
      .slice(0, limit);
  }

  buildMissingInputsMessage(missingInputs: string[]): string {
    if (!missingInputs.length) {
      return ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE;
    }

    if (missingInputs.length === 1) {
      return `Please choose ${missingInputs[0]} as it is required for your advice.`;
    }

    const leading = missingInputs.slice(0, -1).join(", ");
    const trailing = missingInputs[missingInputs.length - 1];
    return `Please choose ${leading} and ${trailing} as they are required for your advice.`;
  }

  buildRecommendationSummary(totalResults: number): AdvisorSummaryAlert {
    if (totalResults > 0) {
      return {
        tone: "positive",
        title: `${totalResults} recommended server${totalResults === 1 ? "" : "s"} found`,
        body: "These recommendations reflect your current advisor inputs and search filters.",
      };
    }

    return {
      tone: "neutral",
      title: "No matches yet",
      body: "Adjust the advisor inputs or filters to discover matching server recommendations.",
    };
  }
}
