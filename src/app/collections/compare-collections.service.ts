import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { CollectionsStore } from "./collections.store";
import type { SavedComparisonInstance } from "./collections.types";
import { mutationKey } from "../shared/store/with-mutation-status";
import { canonicalizeCompareUrl } from "../pages/server-compare/compare-url-state.utils";

@Injectable({ providedIn: "root" })
export class CompareCollectionsService {
  readonly store = inject(CollectionsStore);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  compareUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return canonicalizeCompareUrl(
        `${window.location.pathname}${window.location.search}`,
      );
    }
    return canonicalizeCompareUrl(this.router.url.split("#")[0]);
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
    compareUrl = this.compareUrl(),
  ): void {
    this.store.saveComparison({
      id,
      compareUrl: canonicalizeCompareUrl(compareUrl),
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
    compareUrl = this.compareUrl(),
  ): void {
    this.store.updateComparison({
      id,
      compareUrl: canonicalizeCompareUrl(compareUrl),
      instances,
      name,
      note,
    });
  }

  deleteComparison(id: string): void {
    this.store.deleteComparison(id);
  }

  savedComparisonByUrls(compareUrl: string, fallbackUrl?: string | null) {
    const saved = this.store.savedComparisonByUrl(
      canonicalizeCompareUrl(compareUrl),
    );
    if (saved || !fallbackUrl) {
      return saved ?? null;
    }

    return this.store.savedComparisonByUrl(canonicalizeCompareUrl(fallbackUrl));
  }

  buildComparisonId(
    instances: SavedComparisonInstance[],
    compareUrl = this.compareUrl(),
  ): string {
    const canonicalUrl = canonicalizeCompareUrl(compareUrl);
    const exactByUrl = this.savedComparisonByUrls(canonicalUrl);
    if (exactByUrl) {
      return exactByUrl.id;
    }

    const key = JSON.stringify({
      url: canonicalUrl,
      instances,
    });
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `comparison-${Math.abs(hash).toString(36)}`;
  }
}
