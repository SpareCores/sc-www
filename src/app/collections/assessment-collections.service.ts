import { Injectable, inject } from "@angular/core";
import { CollectionsStore } from "./collections.store";
import type { SearchBarQuery } from "../components/search-bar/types/search-bar.types";
import { assessmentComparableQuery } from "./collections.utils";
import { mutationKey } from "../shared/store/with-mutation-status";

@Injectable({ providedIn: "root" })
export class AssessmentCollectionsService {
  readonly store = inject(CollectionsStore);

  activeSavedAssessment(query: SearchBarQuery) {
    return this.store.savedAssessmentByQuery(query);
  }

  buildAssessmentId(query: SearchBarQuery): string {
    const saved = this.activeSavedAssessment(query);
    if (saved) {
      return saved.id;
    }

    const key = JSON.stringify(assessmentComparableQuery(query));
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `assessment-${Math.abs(hash).toString(36)}`;
  }

  isSavingAssessment(id: string): boolean {
    return this.store.isMutating(mutationKey("save-assessment", id));
  }

  isUpdatingAssessment(id: string): boolean {
    return this.store.isMutating(mutationKey("update-assessment", id));
  }

  isDeletingAssessment(id: string): boolean {
    return this.store.isMutating(mutationKey("delete-assessment", id));
  }

  saveAssessment(
    id: string,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.saveAssessment({ id, query, name, note });
  }

  updateAssessment(
    id: string,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.updateAssessment({ id, query, name, note });
  }

  deleteAssessment(id: string): void {
    this.store.deleteAssessment(id);
  }
}
