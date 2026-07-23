import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

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

  it("tracks the selected baseline server", () => {
    service.setBaselineServer({ vendor: "aws", server: "a1" });

    expect(service.isBaselineServer(serverA)).toBeTrue();
    expect(service.isBaselineServer(serverB)).toBeFalse();
  });

  it("toggles baseline selection and clears on second click", () => {
    service.toggleBaselineServer(serverA);

    expect(service.isBaselineServer(serverA)).toBeTrue();

    service.toggleBaselineServer(serverA);

    expect(service.baselineServer).toBeNull();
  });

  it("clears baseline when the baseline server is removed", () => {
    service.setBaselineServer({ vendor: "aws", server: "a1" });

    service.toggleCompare(false, serverA);

    expect(service.baselineServer).toBeNull();
  });

  it("clears baseline when clearing compare selection", () => {
    service.setBaselineServer({ vendor: "gcp", server: "b1" });

    service.clearCompare();

    expect(service.baselineServer).toBeNull();
  });

  it("syncs the compare route after selection changes while on compare", () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, "url", "get").and.returnValue(
      "/compare?instances=old",
    );
    const navigateByUrl = spyOn(router, "navigateByUrl");
    service.selectedForCompare = [
      {
        display_name: "A+B/C=",
        vendor: "aws",
        server: "a1",
        zonesRegions: [{ zone: "zone+1", region: "us-east/1" }],
      },
      serverB,
    ];
    const expectedInstances = btoa(JSON.stringify(service.selectedForCompare));
    service.setBaselineServer({ vendor: "aws", server: "a1" });

    service.syncCompareRoute();

    const navigatedUrl = navigateByUrl.calls.mostRecent().args[0] as string;
    const queryParams = new URL(navigatedUrl, "http://localhost").searchParams;

    expect(queryParams.get("instances")).toBe(expectedInstances);
    expect(queryParams.get("baseline_vendor")).toBe("aws");
    expect(queryParams.get("baseline_server")).toBe("a1");
    expect(navigatedUrl).toContain(encodeURIComponent(expectedInstances));
  });

  it("does not sync the compare route when not on compare", () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, "url", "get").and.returnValue("/servers");
    const navigateByUrl = spyOn(router, "navigateByUrl");

    service.syncCompareRoute();

    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
