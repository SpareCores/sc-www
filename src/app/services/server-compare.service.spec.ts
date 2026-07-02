import { TestBed } from "@angular/core/testing";

import { ServerCompare, ServerCompareService } from "./server-compare.service";

describe("ServerCompareService", () => {
  let service: ServerCompareService;

  const serverA: ServerCompare = {
    display_name: "A",
    vendor: "aws",
    server: "a1",
    zonesRegions: [],
  };
  const serverB: ServerCompare = {
    display_name: "B",
    vendor: "gcp",
    server: "b1",
    zonesRegions: [],
  };
  const serverC: ServerCompare = {
    display_name: "C",
    vendor: "azure",
    server: "c1",
    zonesRegions: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerCompareService);
    service.selectedForCompare = [serverA, serverB, serverC];
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("reorders selected servers", () => {
    service.reorderSelectedForCompare(0, 2);

    expect(service.selectedForCompare).toEqual([serverB, serverC, serverA]);
  });

  it("ignores no-op reorder moves", () => {
    const selectionChanged = jasmine.createSpy("selectionChanged");
    service.selectionChanged.subscribe(selectionChanged);

    service.reorderSelectedForCompare(1, 1);

    expect(service.selectedForCompare).toEqual([serverA, serverB, serverC]);
    expect(selectionChanged).not.toHaveBeenCalled();
  });

  it("keeps remaining order after removing a server", () => {
    service.toggleCompare(false, serverB);

    expect(service.selectedForCompare).toEqual([serverA, serverC]);
  });
});
