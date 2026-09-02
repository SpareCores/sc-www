import { Injectable, inject } from "@angular/core";
import { CollectionsStore } from "./collections.store";
import type { SearchBarQuery } from "../components/search-bar/search-bar.types";
import { adviceComparableQuery } from "./collections.utils";
import { mutationKey } from "../shared/store/with-mutation-status";

@Injectable({ providedIn: "root" })
export class AdviceCollectionsService {
  readonly store = inject(CollectionsStore);

  activeSavedAdvice(query: SearchBarQuery) {
    return this.store.savedAdviceByQuery(query);
  }

  buildAdviceId(query: SearchBarQuery): string {
    const saved = this.activeSavedAdvice(query);
    if (saved) {
      return saved.id;
    }

    const key = JSON.stringify(adviceComparableQuery(query));
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `advice-${Math.abs(hash).toString(36)}`;
  }

  isSavingAdvice(id: string): boolean {
    return this.store.isMutating(mutationKey("save-advice", id));
  }

  isUpdatingAdvice(id: string): boolean {
    return this.store.isMutating(mutationKey("update-advice", id));
  }

  saveAdvice(
    id: string,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.saveAdvice({ id, query, name, note });
  }

  updateAdvice(
    id: string,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.updateAdvice({ id, query, name, note });
  }

  deleteAdvice(id: string): void {
    this.store.deleteAdvice(id);
  }
}
