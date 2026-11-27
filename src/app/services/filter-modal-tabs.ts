import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class FilterModalTabs {
  private readonly lastCategoryIds = new Map<string, string>();

  get(pageKey: string): string | null {
    return this.lastCategoryIds.get(pageKey) ?? null;
  }

  set(pageKey: string, categoryId: string) {
    this.lastCategoryIds.set(pageKey, categoryId);
  }
}
