import { PendingOpenSaveTarget } from "../../../collections/collections-ui";
import type { SavedComparisonInstance } from "../../../collections/collections.types";
import { BreadcrumbSegment } from "../../../components/breadcrumbs/breadcrumbs";
import { CollectionSaveModal } from "../../../components/collections/collection-save-modal/collection-save-modal";
import { CurrencyOption } from "../../../tools/shared_data";

export interface ComparePageConfig {
  collectionTarget: PendingOpenSaveTarget;
  comparePath: string;
  parentBreadcrumb: BreadcrumbSegment;
  guideTitle: string;
  guideDescription: string;
  comparisonTitle: string;
  baselineIdParam: string;
  keywords: string;
}

export interface ComparePageHost {
  instances(): SavedComparisonInstance[];
  instancesRaw(): string;
  baseline(): { vendor_id: string; api_reference: string } | null;
  currency(): CurrencyOption;
  isLoading(): boolean;
  compareDataReady(): boolean;
  saveModal(): CollectionSaveModal | undefined;
  onLoadFinished(): void;
}
