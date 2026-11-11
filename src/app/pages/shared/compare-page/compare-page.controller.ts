import { isPlatformBrowser } from "@angular/common";
import {
  DestroyRef,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { distinctUntilChanged, map, merge } from "rxjs";
import { CollectionsUi } from "../../../collections/collections-ui";
import type { SavedComparisonItem } from "../../../collections/collections.types";
import { SAVED_ITEM_FALLBACK_NOTE } from "../../../collections/collections.utils";
import { CompareCollections } from "../../../collections/compare-collections";
import { BreadcrumbSegment } from "../../../components/breadcrumbs/breadcrumbs";
import { AuthState } from "../../../core/auth";
import { SeoHandler } from "../../../services/seo-handler";
import { navigateListingQuery } from "../../../tools/listing-query-navigate";
import { encodeQueryParams } from "../../../tools/queryParamFunctions";
import {
  CurrencyOption,
  availableCurrencies,
} from "../../../tools/shared_data";
import { ComparePageConfig, ComparePageHost } from "./compare-page.types";
import {
  COMPARE_BREADCRUMB,
  CUSTOM_COMPARISON_BREADCRUMB,
} from "./compare-page.constants";

export class ComparePageController {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private seoHandler = inject(SeoHandler);
  private auth = inject(AuthState);
  private compareCollections = inject(CompareCollections);
  private collectionsUi = inject(CollectionsUi);

  private readonly pendingSaveClose = signal(false);
  private readonly editingComparisonId = signal<string | null>(null);
  private bookmarkSource: SavedComparisonItem | null = null;
  private lastEncodedQuery: string | null = null;

  title: string;
  description: string;
  breadcrumbs: BreadcrumbSegment[];
  readonly keywords: string;

  constructor(
    private config: ComparePageConfig,
    private host: ComparePageHost,
  ) {
    this.title = config.guideTitle;
    this.description = config.guideDescription;
    this.keywords = config.keywords;
    this.breadcrumbs = this.baseBreadcrumbs();

    effect(() => {
      this.compareCollections.store.savedComparisons();
      this.compareCollections.store.requestStatus();
      if (this.host.compareDataReady() && this.host.isLoading()) {
        this.finishLoadIfReady();
        return;
      }
      if (!this.host.isLoading()) {
        this.syncSavedComparisonChrome();
      }
    });

    effect(() => {
      if (!this.isAuthenticated()) {
        return;
      }
      if (!this.host.saveModal()) {
        return;
      }
      if (
        !this.collectionsUi.takePendingOpenSave(this.config.collectionTarget)
      ) {
        return;
      }
      untracked(() => this.openSaveComparisonModal());
    });

    effect(() => {
      if (!this.pendingSaveClose()) {
        return;
      }

      this.compareCollections.store.savedComparisons();
      const editingId = this.editingComparisonId();
      const saved = this.activeSavedComparison();
      const id =
        editingId ??
        this.compareCollections.buildComparisonId(
          this.host.instances(),
          this.canonicalUrl(),
        );
      const saving = this.compareCollections.isSavingComparison(id);
      const updating = editingId
        ? this.compareCollections.isUpdatingComparison(editingId)
        : saved
          ? this.compareCollections.isUpdatingComparison(saved.id)
          : false;

      if (saving || updating) {
        return;
      }

      this.pendingSaveClose.set(false);
      if (editingId || saved) {
        this.host.saveModal()?.close();
      }
    });
  }

  watchRoute(onChange: () => void): void {
    merge(this.route.paramMap, this.route.queryParamMap)
      .pipe(
        map(() => this.routeKey()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.isOwnUrlWrite()) {
          return;
        }
        onChange();
      });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  exactSavedComparison(): SavedComparisonItem | null {
    const specialId = this.route.snapshot.paramMap.get("id");
    return this.compareCollections.savedComparisonByUrls(
      this.canonicalUrl(),
      specialId ? `${this.config.comparePath}/${specialId}` : null,
    );
  }

  activeSavedComparison(): SavedComparisonItem | null {
    return this.exactSavedComparison();
  }

  canSaveComparison(): boolean {
    return this.isAuthenticated() && this.host.instances().length >= 2;
  }

  isSaveComparisonPending(): boolean {
    const editingId = this.editingComparisonId();
    if (editingId) {
      return this.compareCollections.isUpdatingComparison(editingId);
    }

    const saved = this.activeSavedComparison();
    if (saved) {
      return this.compareCollections.isUpdatingComparison(saved.id);
    }

    return this.compareCollections.isSavingComparison(
      this.compareCollections.buildComparisonId(
        this.host.instances(),
        this.canonicalUrl(),
      ),
    );
  }

  isDeleteComparisonPending(): boolean {
    const saved = this.exactSavedComparison();
    return !!saved && this.compareCollections.isDeletingComparison(saved.id);
  }

  openSaveComparisonModal(): void {
    if (!this.isAuthenticated()) {
      this.collectionsUi.promptRegisterForFeature({
        type: "open-save",
        target: this.config.collectionTarget,
      });
      return;
    }

    const exact = this.exactSavedComparison();
    const draft = exact ?? this.bookmarkSource;
    this.editingComparisonId.set(exact?.id ?? null);
    this.host.saveModal()?.open(draft?.name ?? "", draft?.note ?? "");
  }

  toggleSavedComparison(): void {
    if (this.exactSavedComparison()) {
      this.deleteSavedComparison();
      return;
    }

    this.openSaveComparisonModal();
  }

  confirmSaveComparison(payload: { name: string; note?: string }): void {
    this.syncUrlState();
    const instances = this.host.instances();
    const compareUrl = this.canonicalUrl();
    const editingId = this.editingComparisonId();
    this.pendingSaveClose.set(true);

    if (editingId) {
      this.compareCollections.updateComparison(
        editingId,
        instances,
        payload.name,
        payload.note,
        compareUrl,
      );
      return;
    }

    this.compareCollections.saveComparison(
      this.compareCollections.buildComparisonId(instances, compareUrl),
      instances,
      payload.name,
      payload.note,
      compareUrl,
    );
  }

  deleteSavedComparison(): void {
    const saved = this.exactSavedComparison();
    if (!saved) {
      return;
    }

    this.compareCollections.deleteComparison(saved.id);
    this.bookmarkSource = null;
  }

  baseBreadcrumbs(): BreadcrumbSegment[] {
    return [
      { name: "Home", url: "/" },
      this.config.parentBreadcrumb,
      { name: COMPARE_BREADCRUMB, url: this.config.comparePath },
    ];
  }

  setPremadeBreadcrumb(title: string, id: string): void {
    this.breadcrumbs = [
      ...this.baseBreadcrumbs(),
      { name: title, url: `${this.config.comparePath}/${id}` },
    ];
  }

  setCustomBreadcrumb(count: number): void {
    const instancesRaw = this.host.instancesRaw();
    this.breadcrumbs = count
      ? [
          ...this.baseBreadcrumbs(),
          {
            name: `${CUSTOM_COMPARISON_BREADCRUMB} (${count})`,
            url: this.config.comparePath,
            queryParams: instancesRaw ? { instances: instancesRaw } : undefined,
          },
        ]
      : this.baseBreadcrumbs();
  }

  applyGuideChrome(): void {
    this.applyChrome(this.config.guideTitle, this.config.guideDescription);
  }

  applyComparisonChrome(title?: string, description?: string): void {
    this.applyChrome(
      title || this.config.comparisonTitle,
      description || this.config.guideDescription,
    );
  }

  updateSeo(): void {
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );
  }

  syncSavedComparisonChrome(): void {
    const exact = this.exactSavedComparison();
    const count = this.host.instances().length;
    if (exact) {
      this.bookmarkSource = exact;
    } else if (!count) {
      this.bookmarkSource = null;
    }

    if (exact && count) {
      this.title = exact.name;
      this.description = exact.note?.trim() || SAVED_ITEM_FALLBACK_NOTE;
      this.breadcrumbs = [
        ...this.baseBreadcrumbs(),
        { name: exact.name, url: exact.compare_url },
      ];
      this.seoHandler.updateTitleAndMetaTags(
        `${exact.name} - Spare Cores`,
        this.description,
        this.keywords,
      );
      return;
    }

    if (this.route.snapshot.paramMap.get("id")) {
      return;
    }

    if (count) {
      this.title = this.config.comparisonTitle;
      this.description = this.config.guideDescription;
      this.setCustomBreadcrumb(count);
      this.seoHandler.updateTitleAndMetaTags(
        `${this.title} - Spare Cores`,
        this.description,
        this.keywords,
      );
      return;
    }

    this.applyGuideChrome();
  }

  finishLoadIfReady(): void {
    if (!this.host.compareDataReady() || !this.collectionsReadyForChrome()) {
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.syncSavedComparisonChrome();
    this.host.onLoadFinished();
  }

  urlQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const instancesRaw = this.host.instancesRaw();
    const baseline = this.host.baseline();
    const currency = this.host.currency();

    if (instancesRaw) {
      params["instances"] = instancesRaw;
    }

    if (baseline) {
      params["baseline_vendor"] = baseline.vendor_id;
      params[this.config.baselineIdParam] = baseline.api_reference;
    }

    if (currency.slug !== "USD") {
      params["currency"] = currency.slug;
    }

    return params;
  }

  canonicalUrl(): string {
    const encodedQuery = encodeQueryParams(this.urlQueryParams());
    return encodedQuery
      ? `${this.config.comparePath}?${encodedQuery}`
      : this.config.comparePath;
  }

  rememberUrlState(): void {
    this.lastEncodedQuery = encodeQueryParams(this.urlQueryParams());
    this.syncSavedComparisonChrome();
  }

  syncUrlState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const queryParams = this.urlQueryParams();
    const encodedQuery = encodeQueryParams(queryParams);

    if (this.route.snapshot.paramMap.get("id")) {
      this.lastEncodedQuery = encodedQuery;
      void this.router.navigateByUrl(this.canonicalUrl(), { replaceUrl: true });
      this.syncSavedComparisonChrome();
      return;
    }

    if (encodedQuery === this.lastEncodedQuery) {
      return;
    }

    this.lastEncodedQuery = encodedQuery;
    navigateListingQuery(this.router, this.route, queryParams, {
      params: "replace",
      history: "push",
      preserveFragment: true,
    });
    this.syncSavedComparisonChrome();
  }

  currencyFromUrl(): CurrencyOption {
    const currencySlug = isPlatformBrowser(this.platformId)
      ? new URLSearchParams(window.location.search).get("currency")
      : this.route.snapshot.queryParams["currency"];

    return (
      availableCurrencies.find((currency) => currency.slug === currencySlug) ||
      availableCurrencies[0]
    );
  }

  private applyChrome(title: string, description: string): void {
    this.title = title;
    this.description = description;
    this.bookmarkSource = null;
    this.breadcrumbs = this.baseBreadcrumbs();
    this.updateSeo();
  }

  private collectionsReadyForChrome(): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.isAuthenticated()) {
      return true;
    }

    return (
      this.compareCollections.store.isLoaded() ||
      !!this.compareCollections.store.error()
    );
  }

  private routeKey(): string {
    const snapshot = this.route.snapshot;
    return [
      snapshot.paramMap.get("id") ?? "",
      snapshot.queryParams["instances"] ?? "",
      snapshot.queryParams["currency"] ?? "",
      snapshot.queryParams["baseline_vendor"] ?? "",
      snapshot.queryParams[this.config.baselineIdParam] ?? "",
    ].join("|");
  }

  private isOwnUrlWrite(): boolean {
    const snapshot = this.route.snapshot;
    if (!this.host.compareDataReady() || snapshot.paramMap.get("id")) {
      return false;
    }
    const q = snapshot.queryParams;
    return (
      encodeQueryParams({
        instances: q["instances"],
        baseline_vendor: q["baseline_vendor"],
        [this.config.baselineIdParam]: q[this.config.baselineIdParam],
        currency: q["currency"],
      }) === this.lastEncodedQuery
    );
  }
}
