import { TestBed } from "@angular/core/testing";
import { FilterModalTabs } from "./filter-modal-tabs";

describe("FilterModalTabs", () => {
  let service: FilterModalTabs;

  beforeEach(() => {
    service = TestBed.inject(FilterModalTabs);
  });

  it("remembers the last category per page", () => {
    expect(service.get("/servers")).toBeNull();

    service.set("/servers", "gpu");

    expect(service.get("/servers")).toBe("gpu");
    expect(service.get("/storages")).toBeNull();
  });
});
