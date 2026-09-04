import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { LucideDynamicIcon } from "@lucide/angular";
import { Modal, ModalOptions } from "flowbite";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { Button } from "../../components/button/button";
import { PageHeader } from "../../components/page-header/page-header";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { CollectionSaveModalComponent } from "../../components/collections/collection-save-modal/collection-save-modal.component";
import { CollectionsStore } from "../../collections/collections.store";
import type {
  BookmarksCardViewModel,
  BookmarksFilterKey,
} from "../../collections/collections.types";
import { formatMemoryAmount, formatStorageSize } from "../../pipes/pipe-utils";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { mutationKey } from "../../shared/store/with-mutation-status";

type BookmarksFeature = {
  name: string;
  value: string;
};

type BookmarksVendor = {
  name: string;
  logo?: string;
};

const FILTER_LABELS: Record<BookmarksFilterKey, string> = {
  favoriteServers: "Servers",
  favoriteDatabases: "Databases",
  savedSearches: "Searches",
  savedComparisons: "Comparisons",
  savedAdvices: "Assessments",
};

const STAT_ICONS: Record<BookmarksFilterKey, string> = {
  favoriteServers: "pc-case",
  favoriteDatabases: "database",
  savedSearches: "search",
  savedComparisons: "scale",
  savedAdvices: "bot",
};

const INSTANCE_PREVIEW_COUNT = 6;

const EDITABLE_KINDS = new Set([
  "savedSearches",
  "savedComparisons",
  "savedAdvices",
]);

const noteModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40",
  closable: true,
};

function normalizeBookmarksNameQuery(value: string): string {
  return value.trim().toLocaleLowerCase();
}

@Component({
  selector: "sc-bookmarks",
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    PageHeader,
    Button,
    LoadingSpinnerComponent,
    CdkDropList,
    CdkDrag,
    LucideDynamicIcon,
    CollectionSaveModalComponent,
  ],
  templateUrl: "./bookmarks.html",
  styleUrl: "./bookmarks.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Bookmarks implements OnDestroy {
  private collectionsStore = inject(CollectionsStore);
  private keeperAPI = inject(KeeperAPIService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private uiTooltip = inject(UiTooltipService);
  private platformId = inject(PLATFORM_ID);

  private saveModal = viewChild(CollectionSaveModalComponent);
  private noteModalRef = viewChild<ElementRef<HTMLElement>>("noteModal");
  private tooltipRef = viewChild<ElementRef<HTMLElement>>("tooltipDefault");
  private noteFlowbiteModal: Modal | null = null;
  private loadingFavoriteFeatures = new Set<string>();
  private vendorsLoaded = false;

  protected breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Bookmarks", url: "/bookmarks" },
  ];

  protected expandedDetails = signal<Record<string, boolean>>({});
  protected nameQuery = signal("");
  private shareIcons = signal<Record<string, string>>({});
  protected editingCard = signal<BookmarksCardViewModel | null>(null);
  protected noteCard = signal<BookmarksCardViewModel | null>(null);
  protected isNoteModalOpen = signal(false);
  private readonly pendingEditClose = signal(false);
  private favoriteFeatures = signal<Record<string, BookmarksFeature[]>>({});
  private vendorsById = signal<Record<string, BookmarksVendor>>({});
  protected tooltipContent = "";

  protected cards = computed(() => {
    const query = normalizeBookmarksNameQuery(this.nameQuery());
    const cards = this.collectionsStore.bookmarksCards();

    if (!query) {
      return cards;
    }

    return cards.filter((card) =>
      normalizeBookmarksNameQuery(card.title).includes(query),
    );
  });
  protected stats = computed(() => this.collectionsStore.bookmarksStats());
  protected filters = computed(() => this.collectionsStore.bookmarksFilters());
  protected isLoading = computed(
    () => this.collectionsStore.isLoading() && !this.cards().length,
  );

  protected editModalTitle = computed(() => {
    const card = this.editingCard();
    switch (card?.kind) {
      case "savedSearches":
        return "Edit search";
      case "savedComparisons":
        return "Edit comparison";
      case "savedAdvices":
        return "Edit assessment";
      default:
        return "Edit";
    }
  });

  protected isEditSaving = computed(() => {
    const card = this.editingCard();
    if (!card) {
      return false;
    }
    return this.collectionsStore.isMutating(
      mutationKey(this.updateMutationScope(card.kind), card.id),
    );
  });

  protected statEntries = computed(() => {
    const stats = this.stats();
    const filters = this.filters();
    return (Object.keys(FILTER_LABELS) as BookmarksFilterKey[]).map((key) => ({
      key,
      label: FILTER_LABELS[key],
      icon: STAT_ICONS[key],
      value: stats[key],
      enabled: filters[key],
    }));
  });

  constructor() {
    effect(() => {
      const cards = this.cards();
      const favoriteCards = cards.filter((card) =>
        this.isFavoriteEntityCard(card),
      );

      if (favoriteCards.length) {
        void this.loadVendorNames();
      }

      for (const card of favoriteCards) {
        void this.loadFavoriteFeatures(card);
      }
    });

    effect(() => {
      if (!this.pendingEditClose()) {
        return;
      }

      const card = this.editingCard();
      if (!card) {
        this.pendingEditClose.set(false);
        return;
      }

      this.collectionsStore.savedSearches();
      this.collectionsStore.savedComparisons();
      this.collectionsStore.savedAdvices();

      if (
        this.collectionsStore.isMutating(
          mutationKey(this.updateMutationScope(card.kind), card.id),
        )
      ) {
        return;
      }

      this.pendingEditClose.set(false);
      this.saveModal()?.close();
      this.editingCard.set(null);
    });
  }

  ngOnDestroy(): void {
    this.noteFlowbiteModal?.hide();
    this.noteFlowbiteModal = null;
  }

  protected toggleFilter(key: BookmarksFilterKey, enabled: boolean): void {
    this.collectionsStore.setBookmarksFilter(key, enabled);
  }

  protected onNameQueryInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.nameQuery.set(target.value);
  }

  protected cardKey(card: BookmarksCardViewModel): string {
    return `${card.kind}:${card.id}`;
  }

  protected cardSubtitle(card: BookmarksCardViewModel): string | undefined {
    const vendorId = this.favoriteCardVendorId(card);
    if (vendorId) {
      return this.vendorsById()[vendorId]?.name ?? vendorId;
    }
    return card.subtitle;
  }

  protected cardVendorLogo(card: BookmarksCardViewModel): string | undefined {
    const vendorId = this.favoriteCardVendorId(card);
    return vendorId ? this.vendorsById()[vendorId]?.logo : undefined;
  }

  protected cardFeatures(card: BookmarksCardViewModel): BookmarksFeature[] {
    return this.favoriteFeatures()[this.cardKey(card)] ?? [];
  }

  protected isEditableCard(card: BookmarksCardViewModel): boolean {
    return EDITABLE_KINDS.has(card.kind);
  }

  protected cardActionCount(card: BookmarksCardViewModel): number {
    let count = 1;
    if (this.isEditableCard(card)) {
      count += 2;
    }
    if (this.cardLink(card)) {
      count += 2;
    }
    return count;
  }

  protected toggleDetails(cardId: string): void {
    this.expandedDetails.update((state) => ({
      ...state,
      [cardId]: !state[cardId],
    }));
  }

  protected isDetailsExpanded(cardId: string): boolean {
    return !!this.expandedDetails()[cardId];
  }

  protected showDetailTooltip(event: MouseEvent, content: string): void {
    const tooltip = this.tooltipRef()?.nativeElement;
    const target = event.currentTarget;
    if (
      !tooltip ||
      !content ||
      !(target instanceof HTMLElement) ||
      target.scrollWidth <= target.clientWidth
    ) {
      return;
    }

    this.tooltipContent = content;
    this.uiTooltip.show(tooltip, event, {
      left: "anchor-right",
      top: "anchor-below",
    });
  }

  protected hideDetailTooltip(): void {
    const tooltip = this.tooltipRef()?.nativeElement;
    if (!tooltip) {
      return;
    }
    this.uiTooltip.hide(tooltip);
  }

  protected detailsNeedToggle(card: BookmarksCardViewModel): boolean {
    return (card.details?.length ?? 0) > INSTANCE_PREVIEW_COUNT;
  }

  protected visibleDetails(card: BookmarksCardViewModel) {
    const details = card.details ?? [];
    if (
      this.isDetailsExpanded(this.cardKey(card)) ||
      details.length <= INSTANCE_PREVIEW_COUNT
    ) {
      return details;
    }
    return details.slice(0, INSTANCE_PREVIEW_COUNT);
  }

  protected drop(event: CdkDragDrop<BookmarksCardViewModel[]>): void {
    const next = [...this.cards()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.collectionsStore.reorderBookmarksCards(next);
  }

  protected deleteCard(card: BookmarksCardViewModel): void {
    if (this.isDeletingCard(card)) {
      return;
    }

    switch (card.kind) {
      case "favoriteServers":
        if (card.id) {
          this.collectionsStore.removeFavoriteServerById(card.id);
        }
        break;
      case "favoriteDatabases":
        if (card.id) {
          this.collectionsStore.removeFavoriteDatabaseById(card.id);
        }
        break;
      case "savedSearches":
        this.collectionsStore.deleteSearch(card.id);
        break;
      case "savedComparisons":
        this.collectionsStore.deleteComparison(card.id);
        break;
      case "savedAdvices":
        this.collectionsStore.deleteAdvice(card.id);
        break;
    }
  }

  protected isDeletingCard(card: BookmarksCardViewModel): boolean {
    return this.collectionsStore.isMutating(
      mutationKey(this.deleteMutationScope(card.kind), card.id),
    );
  }

  protected openEditCard(card: BookmarksCardViewModel): void {
    this.editingCard.set(card);
    this.saveModal()?.open(card.title, card.note ?? "");
  }

  protected confirmEditCard(payload: { name: string; note?: string }): void {
    const card = this.editingCard();
    if (!card) {
      return;
    }

    switch (card.kind) {
      case "savedSearches": {
        const item = this.collectionsStore.searchesEntityMap()[card.id];
        if (!item) {
          return;
        }
        this.pendingEditClose.set(true);
        this.collectionsStore.updateSearch({
          id: card.id,
          page: item.page,
          query: item.query,
          name: payload.name,
          note: payload.note,
        });
        break;
      }
      case "savedComparisons": {
        const item = this.collectionsStore.comparisonsEntityMap()[card.id];
        if (!item) {
          return;
        }
        this.pendingEditClose.set(true);
        this.collectionsStore.updateComparison({
          id: card.id,
          compareUrl: item.compare_url,
          instances: item.instances,
          name: payload.name,
          note: payload.note,
        });
        break;
      }
      case "savedAdvices": {
        const item = this.collectionsStore.advicesEntityMap()[card.id];
        if (!item) {
          return;
        }
        this.pendingEditClose.set(true);
        this.collectionsStore.updateAdvice({
          id: card.id,
          query: item.query,
          name: payload.name,
          note: payload.note,
        });
        break;
      }
      default:
        return;
    }
  }

  protected onEditModalClosed(): void {
    this.editingCard.set(null);
  }

  protected openNoteCard(card: BookmarksCardViewModel): void {
    if (!card.note || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.noteCard.set(card);
    this.isNoteModalOpen.set(true);
    this.ensureNoteModal()?.show();
  }

  protected closeNoteModal(): void {
    this.noteFlowbiteModal?.hide();
  }

  protected cardLink(card: BookmarksCardViewModel): string | any[] | null {
    const link = card.href ?? null;
    if (!link) {
      return null;
    }
    if (
      Array.isArray(link) &&
      link.some((segment) => segment == null || segment === "")
    ) {
      return null;
    }
    return link;
  }

  protected openCard(card: BookmarksCardViewModel): void {
    const link = this.cardLink(card);
    if (!link) {
      return;
    }

    if (typeof link === "string") {
      void this.router.navigateByUrl(link);
      return;
    }

    void this.router.navigate(link);
  }

  protected shareIcon(card: BookmarksCardViewModel): string {
    return this.shareIcons()[this.cardKey(card)] ?? "clipboard";
  }

  protected shareCard(card: BookmarksCardViewModel): void {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
      return;
    }

    const url = this.cardShareUrl(card);
    if (!url) {
      return;
    }

    const key = this.cardKey(card);
    void navigator.clipboard.writeText(url).then(() => {
      this.shareIcons.update((state) => ({ ...state, [key]: "check" }));
      this.toastService.show({
        title: "Link copied to clipboard!",
        type: "success",
        duration: 2000,
      });
      setTimeout(() => {
        this.shareIcons.update((state) => {
          const next = { ...state };
          delete next[key];
          return next;
        });
      }, 3000);
    });
  }

  private updateMutationScope(kind: BookmarksCardViewModel["kind"]): string {
    switch (kind) {
      case "savedSearches":
        return "update-search";
      case "savedComparisons":
        return "update-comparison";
      case "savedAdvices":
        return "update-advice";
      default:
        return "update";
    }
  }

  private deleteMutationScope(kind: BookmarksCardViewModel["kind"]): string {
    switch (kind) {
      case "favoriteServers":
        return "favorite-server";
      case "favoriteDatabases":
        return "favorite-database";
      case "savedSearches":
        return "delete-search";
      case "savedComparisons":
        return "delete-comparison";
      case "savedAdvices":
        return "delete-advice";
      default:
        return "delete";
    }
  }

  private async loadVendorNames(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.vendorsLoaded) {
      return;
    }

    this.vendorsLoaded = true;

    try {
      const vendors = this.unwrapBody(await this.keeperAPI.getVendors());
      const nextVendors: Record<string, BookmarksVendor> = {};

      if (Array.isArray(vendors)) {
        for (const vendor of vendors) {
          const id = vendor?.vendor_id;
          const name = vendor?.name;
          if (id && name) {
            nextVendors[id] = { name, logo: vendor.logo || undefined };
          }
        }
      }

      this.vendorsById.set(nextVendors);
    } catch {
      this.vendorsLoaded = false;
    }
  }

  private async loadFavoriteFeatures(
    card: BookmarksCardViewModel,
  ): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const key = this.cardKey(card);
    if (this.favoriteFeatures()[key] || this.loadingFavoriteFeatures.has(key)) {
      return;
    }

    const params = this.favoriteCardParams(card);
    if (!params) {
      return;
    }

    this.loadingFavoriteFeatures.add(key);

    try {
      const features =
        card.kind === "favoriteServers"
          ? await this.fetchServerFeatures(params.vendorId, params.entityId)
          : await this.fetchDatabaseFeatures(params.vendorId, params.entityId);

      this.favoriteFeatures.update((state) => ({
        ...state,
        [key]: features,
      }));
    } catch {
      this.favoriteFeatures.update((state) => ({
        ...state,
        [key]: [],
      }));
    } finally {
      this.loadingFavoriteFeatures.delete(key);
    }
  }

  private async fetchServerFeatures(
    vendorId: string,
    serverId: string,
  ): Promise<BookmarksFeature[]> {
    const server = this.unwrapBody(
      await this.keeperAPI.getServerV2(vendorId, serverId),
    );
    const features: BookmarksFeature[] = [];

    if (server?.cpu_cores || server?.vcpus) {
      features.push({
        name: "vCPU",
        value: `${server.vcpus || server.cpu_cores}`,
      });
    }
    if (server?.memory_amount) {
      features.push({
        name: "Memory",
        value: formatMemoryAmount(server.memory_amount),
      });
    }
    if (server?.storage_size) {
      features.push({
        name: "Storage",
        value: formatStorageSize(server.storage_size),
      });
    }
    if (server?.gpu_count) {
      features.push({
        name: "GPU",
        value: String(server.gpu_count),
      });
    }

    return features;
  }

  private async fetchDatabaseFeatures(
    vendorId: string,
    databaseId: string,
  ): Promise<BookmarksFeature[]> {
    const database = this.unwrapBody(
      await this.keeperAPI.getDatabase(vendorId, databaseId),
    );
    const features: BookmarksFeature[] = [
      {
        name: "vCPUs",
        value:
          database?.vcpus === null || database?.vcpus === undefined
            ? "-"
            : String(database.vcpus),
      },
      {
        name: "Memory",
        value: formatMemoryAmount(database?.memory_amount),
      },
    ];

    if (
      database?.storage_size !== null &&
      database?.storage_size !== undefined
    ) {
      features.push({
        name: "Storage",
        value: `${database.storage_size} GB`,
      });
    }

    features.push({
      name: "Engine",
      value: database?.engine || "-",
    });

    return features;
  }

  private isFavoriteEntityCard(card: BookmarksCardViewModel): boolean {
    return card.kind === "favoriteServers" || card.kind === "favoriteDatabases";
  }

  private favoriteCardVendorId(card: BookmarksCardViewModel): string | null {
    return this.isFavoriteEntityCard(card) && card.subtitle
      ? card.subtitle
      : null;
  }

  private favoriteCardParams(
    card: BookmarksCardViewModel,
  ): { vendorId: string; entityId: string } | null {
    const href = card.href;
    if (!Array.isArray(href) || href.length < 3) {
      return null;
    }

    const vendorId = String(href[1] ?? "");
    const entityId = String(href[2] ?? "");
    return vendorId && entityId ? { vendorId, entityId } : null;
  }

  private unwrapBody<T>(response: T | { body?: T }): T {
    return (response as { body?: T })?.body ?? (response as T);
  }

  private ensureNoteModal(): Modal | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    if (!this.noteFlowbiteModal) {
      const modalElement = this.noteModalRef()?.nativeElement;
      if (!modalElement) {
        return null;
      }

      this.noteFlowbiteModal = new Modal(modalElement, {
        ...noteModalOptions,
        onHide: () => {
          this.isNoteModalOpen.set(false);
          this.noteCard.set(null);
        },
      });
    }

    return this.noteFlowbiteModal;
  }

  private cardShareUrl(card: BookmarksCardViewModel): string | null {
    const link = this.cardLink(card);
    if (!link) {
      return null;
    }

    if (typeof link === "string") {
      if (/^https?:\/\//i.test(link)) {
        return link;
      }
      return new URL(link, window.location.origin).href;
    }

    return new URL(
      this.router.serializeUrl(this.router.createUrlTree(link)),
      window.location.origin,
    ).href;
  }
}
