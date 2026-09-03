import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CollectionsStore } from "./collections.store";
import type { SavedComparisonInstance } from "./collections.types";
import { mutationKey } from "../shared/store/with-mutation-status";

@Injectable({ providedIn: "root" })
export class CompareCollectionsService {
  readonly store = inject(CollectionsStore);
  private router = inject(Router);

  compareUrl(): string {
    return this.router.url.split("#")[0];
  }

  activeSavedComparison() {
    return (
      this.store.savedComparisonByUrl(this.compareUrl()) ??
      this.activeSavedComparisonByRouteId(
        this.router.url.split("/").pop()?.split("?")[0] ?? null,
      )
    );
  }

  activeSavedComparisonByRouteId(id: string | null) {
    if (!id) {
      return null;
    }
    return this.store.savedComparisonById(id);
  }

  isSavingComparison(id: string): boolean {
    return this.store.isMutating(mutationKey("save-comparison", id));
  }

  isUpdatingComparison(id: string): boolean {
    return this.store.isMutating(mutationKey("update-comparison", id));
  }

  isDeletingComparison(id: string): boolean {
    return this.store.isMutating(mutationKey("delete-comparison", id));
  }

  saveComparison(
    id: string,
    instances: SavedComparisonInstance[],
    name: string,
    note?: string,
  ): void {
    this.store.saveComparison({
      id,
      compareUrl: this.compareUrl(),
      instances,
      name,
      note,
    });
  }

  updateComparison(
    id: string,
    instances: SavedComparisonInstance[],
    name: string,
    note?: string,
  ): void {
    this.store.updateComparison({
      id,
      compareUrl: this.compareUrl(),
      instances,
      name,
      note,
    });
  }

  deleteComparison(id: string): void {
    this.store.deleteComparison(id);
  }

  buildComparisonId(instances: SavedComparisonInstance[]): string {
    const saved = this.activeSavedComparison();
    if (saved) {
      return saved.id;
    }

    const routeId = this.router.url.split("/").pop()?.split("?")[0];
    if (
      routeId &&
      routeId !== "compare" &&
      this.store.savedComparisonById(routeId)
    ) {
      return routeId;
    }

    const key = JSON.stringify(instances);
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `comparison-${Math.abs(hash).toString(36)}`;
  }
}
