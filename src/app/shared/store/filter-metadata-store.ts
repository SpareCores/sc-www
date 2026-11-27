import { DestroyRef, inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import type {
  ComplianceFrameworkMetadata,
  CountryMetadata,
  RegionMetadata,
  StorageMetadata,
  VendorMetadata,
} from "../../components/search-bar/types/search-bar.types";
import { KeeperAPI } from "../../services/keeper-api";
import { isAbortError } from "../../services/keeper-http-client";
import { Toast } from "../../services/toast";
import {
  SEARCH_BAR_COMPLIANCE_FRAMEWORKS_ERROR_TOAST_ID,
  SEARCH_BAR_COUNTRIES_ERROR_TOAST_ID,
  SEARCH_BAR_REGIONS_ERROR_TOAST_ID,
  SEARCH_BAR_STORAGES_ERROR_TOAST_ID,
  SEARCH_BAR_VENDORS_ERROR_TOAST_ID,
} from "../../services/toast-ids";
import type { RequestStatus } from "./with-request-status";

type FilterMetadataLists = {
  vendors: VendorMetadata[];
  regions: RegionMetadata[];
  storages: StorageMetadata[];
  complianceFrameworks: ComplianceFrameworkMetadata[];
  countries: CountryMetadata[];
};

export type FilterMetadataList = keyof FilterMetadataLists;

type FilterMetadataState = FilterMetadataLists & {
  statuses: Record<FilterMetadataList, RequestStatus>;
};

const FILTER_METADATA_ERRORS: Record<
  FilterMetadataList,
  { title: string; id: string }
> = {
  vendors: {
    title: "Failed to load vendors",
    id: SEARCH_BAR_VENDORS_ERROR_TOAST_ID,
  },
  regions: {
    title: "Failed to load regions",
    id: SEARCH_BAR_REGIONS_ERROR_TOAST_ID,
  },
  storages: {
    title: "Failed to load storage types",
    id: SEARCH_BAR_STORAGES_ERROR_TOAST_ID,
  },
  complianceFrameworks: {
    title: "Failed to load compliance frameworks",
    id: SEARCH_BAR_COMPLIANCE_FRAMEWORKS_ERROR_TOAST_ID,
  },
  countries: {
    title: "Failed to load countries",
    id: SEARCH_BAR_COUNTRIES_ERROR_TOAST_ID,
  },
};

const initialState: FilterMetadataState = {
  vendors: [],
  regions: [],
  storages: [],
  complianceFrameworks: [],
  countries: [],
  statuses: {
    vendors: "idle",
    regions: "idle",
    storages: "idle",
    complianceFrameworks: "idle",
    countries: "idle",
  },
};

export const FilterMetadataStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (store, keeperAPI = inject(KeeperAPI), toastService = inject(Toast)) => {
      const abortController = new AbortController();
      const requestParams = { signal: abortController.signal };

      inject(DestroyRef).onDestroy(() => abortController.abort());

      const setStatus = (list: FilterMetadataList, status: RequestStatus) => {
        patchState(store, (state) => ({
          statuses: { ...state.statuses, [list]: status },
        }));
      };

      const loadList = async <K extends FilterMetadataList>(
        list: K,
        request: () => Promise<{ body?: FilterMetadataLists[K] }>,
        transform: (rows: FilterMetadataLists[K]) => FilterMetadataLists[K] = (
          rows,
        ) => rows,
      ): Promise<void> => {
        const status = store.statuses()[list];

        if (status === "loading" || status === "loaded") {
          return;
        }

        setStatus(list, "loading");

        try {
          const response = await request();
          const rows = transform(response.body ?? []);
          const lists: Partial<FilterMetadataLists> = { [list]: rows };

          patchState(store, lists);
          setStatus(list, "loaded");
        } catch (error) {
          if (isAbortError(error) || abortController.signal.aborted) {
            return;
          }

          const { title, id } = FILTER_METADATA_ERRORS[list];

          console.error(error);
          setStatus(list, {
            error: error instanceof Error ? error.message : title,
          });
          toastService.show({
            title,
            body: "Please try again later.",
            type: "error",
            id,
          });
        }
      };

      return {
        async load(): Promise<void> {
          await Promise.all([
            loadList("vendors", () => keeperAPI.getVendors(requestParams)),
            loadList(
              "regions",
              () => keeperAPI.getRegions(requestParams),
              (regions) =>
                [...regions].sort((a, b) => a.name.localeCompare(b.name)),
            ),
            loadList("storages", () => keeperAPI.getStorages(requestParams)),
            loadList("complianceFrameworks", () =>
              keeperAPI.getComplianceFrameworks(requestParams),
            ),
            loadList("countries", () => keeperAPI.getCountries(requestParams)),
          ]);
        },
      };
    },
  ),
);
