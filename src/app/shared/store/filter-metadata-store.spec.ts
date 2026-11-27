import { TestBed } from "@angular/core/testing";
import { KeeperAPI } from "../../services/keeper-api";
import { Toast } from "../../services/toast";
import {
  SEARCH_BAR_REGIONS_ERROR_TOAST_ID,
  SEARCH_BAR_VENDORS_ERROR_TOAST_ID,
} from "../../services/toast-ids";
import { FilterMetadataStore } from "./filter-metadata-store";

describe("FilterMetadataStore", () => {
  let keeperAPI: jasmine.SpyObj<KeeperAPI>;
  let toast: jasmine.SpyObj<Toast>;

  beforeEach(() => {
    keeperAPI = jasmine.createSpyObj<KeeperAPI>("KeeperAPI", [
      "getVendors",
      "getRegions",
      "getStorages",
      "getComplianceFrameworks",
      "getCountries",
    ]);
    keeperAPI.getVendors.and.resolveTo({ body: [{ vendor_id: "aws" }] });
    keeperAPI.getRegions.and.resolveTo({
      body: [
        { region_id: "2", vendor_id: "aws", name: "Zurich" },
        { region_id: "1", vendor_id: "aws", name: "Frankfurt" },
      ],
    });
    keeperAPI.getStorages.and.resolveTo({ body: [] });
    keeperAPI.getComplianceFrameworks.and.resolveTo({ body: [] });
    keeperAPI.getCountries.and.resolveTo({ body: [] });
    toast = jasmine.createSpyObj<Toast>("Toast", ["show"]);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeeperAPI, useValue: keeperAPI },
        { provide: Toast, useValue: toast },
      ],
    });
  });

  it("loads each list once and sorts regions by name", async () => {
    const store = TestBed.inject(FilterMetadataStore);

    await Promise.all([store.load(), store.load()]);
    await store.load();

    expect(keeperAPI.getVendors).toHaveBeenCalledTimes(1);
    expect(keeperAPI.getRegions).toHaveBeenCalledTimes(1);
    expect(keeperAPI.getCountries).toHaveBeenCalledTimes(1);
    expect(store.vendors()).toEqual([{ vendor_id: "aws" }]);
    expect(store.regions().map((region) => region.name)).toEqual([
      "Frankfurt",
      "Zurich",
    ]);
    expect(store.statuses().regions).toBe("loaded");
  });

  it("shows a toast per failed list and retries only that list", async () => {
    keeperAPI.getVendors.and.rejectWith(new Error("Vendors down"));
    keeperAPI.getRegions.and.rejectWith(new Error("Regions down"));
    const store = TestBed.inject(FilterMetadataStore);

    await store.load();

    expect(toast.show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: "Failed to load vendors",
        id: SEARCH_BAR_VENDORS_ERROR_TOAST_ID,
      }),
    );
    expect(toast.show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: "Failed to load regions",
        id: SEARCH_BAR_REGIONS_ERROR_TOAST_ID,
      }),
    );
    expect(store.statuses().vendors).toEqual({ error: "Vendors down" });

    keeperAPI.getVendors.and.resolveTo({ body: [{ vendor_id: "gcp" }] });
    await store.load();

    expect(keeperAPI.getVendors).toHaveBeenCalledTimes(2);
    expect(keeperAPI.getStorages).toHaveBeenCalledTimes(1);
    expect(store.vendors()).toEqual([{ vendor_id: "gcp" }]);
  });
});
