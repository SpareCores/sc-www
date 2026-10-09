import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AuthStateService } from "../core/auth";
import { CollectionsUiService } from "../collections/collections-ui.service";
import {
  GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
  GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
} from "./toast-ids";
import { ToastService } from "./toast.service";
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
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CollectionsUiService,
          useValue: {
            promptRegisterForFeature: jasmine.createSpy(
              "promptRegisterForFeature",
            ),
          },
        },
      ],
    });
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
      "/servers/compare?instances=old",
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

    expect(navigatedUrl.startsWith("/servers/compare?")).toBeTrue();
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

  it("toggles database compare selection", () => {
    service.toggleDatabaseCompare(true, {
      display_name: "db-a",
      vendor: "aws",
      database: "db-a",
    });
    service.toggleDatabaseCompare(true, {
      display_name: "db-b",
      vendor: "gcp",
      database: "db-b",
    });

    expect(service.selectedDatabases).toEqual([
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
    ]);
    expect(service.databaseCompareCount()).toBe(2);
    expect(service.compareCount()).toBe(5);
  });

  it("reorders selected databases", () => {
    service.selectedDatabases = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
      { display_name: "db-c", vendor: "azure", database: "db-c" },
    ];

    service.reorderSelectedDatabases(0, 2);

    expect(service.selectedDatabases.map((item) => item.database)).toEqual([
      "db-b",
      "db-c",
      "db-a",
    ]);
  });

  it("opens database compare with encoded instances", () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = spyOn(router, "navigateByUrl");
    service.selectedDatabases = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
    ];
    service.setBaselineDatabase({ vendor: "aws", database: "db-a" });
    const expectedInstances = btoa(JSON.stringify(service.selectedDatabases));

    service.openDatabaseCompare();

    const navigatedUrl = navigateByUrl.calls.mostRecent().args[0] as string;
    const queryParams = new URL(navigatedUrl, "http://localhost").searchParams;

    expect(navigatedUrl.startsWith("/databases/compare?")).toBeTrue();
    expect(queryParams.get("instances")).toBe(expectedInstances);
    expect(queryParams.get("baseline_vendor")).toBe("aws");
    expect(queryParams.get("baseline_database")).toBe("db-a");
  });

  it("syncs the database compare route while on databases/compare", () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, "url", "get").and.returnValue(
      "/databases/compare?instances=old",
    );
    const navigateByUrl = spyOn(router, "navigateByUrl");
    service.selectedDatabases = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
    ];

    service.syncDatabaseCompareRoute();

    expect(navigateByUrl).toHaveBeenCalled();
    expect(
      (navigateByUrl.calls.mostRecent().args[0] as string).startsWith(
        "/databases/compare?",
      ),
    ).toBeTrue();
  });

  it("replaces server compare selection above guest limit without toasts", () => {
    const toastService = TestBed.inject(ToastService);
    const show = spyOn(toastService, "show");
    const selectionChanged = jasmine.createSpy("selectionChanged");
    service.selectionChanged.subscribe(selectionChanged);
    service.setBaselineServer({ vendor: "aws", server: "a1" });
    const hydrated: ServerCompare[] = [
      {
        display_name: "S1",
        vendor: "aws",
        server: "s1",
        zonesRegions: [],
      },
      {
        display_name: "S2",
        vendor: "gcp",
        server: "s2",
        zonesRegions: [
          { zone: "a", region: "us-east-1" },
          { zone: "b", region: "us-west-2" },
        ],
      },
      {
        display_name: "S3",
        vendor: "azure",
        server: "s3",
        zonesRegions: [],
      },
      {
        display_name: "S4",
        vendor: "aws",
        server: "s4",
        zonesRegions: [],
      },
      {
        display_name: "S5",
        vendor: "gcp",
        server: "s5",
        zonesRegions: [],
      },
    ];

    service.replaceServerCompareSelection(hydrated);

    expect(service.selectedForCompare).toEqual(hydrated);
    expect(service.selectedForCompare[1].zonesRegions).toEqual([
      { zone: "a", region: "us-east-1" },
      { zone: "b", region: "us-west-2" },
    ]);
    expect(selectionChanged).toHaveBeenCalledOnceWith(
      service.selectedForCompare,
    );
    expect(show).not.toHaveBeenCalled();
    expect(service.baselineServer).toEqual({ vendor: "aws", server: "a1" });
  });

  it("still enforces guest server compare limit on toggle", () => {
    const toastService = TestBed.inject(ToastService);
    const show = spyOn(toastService, "show");
    const auth = TestBed.inject(AuthStateService);
    const collectionsUi = TestBed.inject(CollectionsUiService);
    spyOn(auth, "isAuthenticated").and.returnValue(false);
    service.selectedForCompare = [
      {
        display_name: "S1",
        vendor: "aws",
        server: "s1",
        zonesRegions: [],
      },
      {
        display_name: "S2",
        vendor: "gcp",
        server: "s2",
        zonesRegions: [],
      },
      {
        display_name: "S3",
        vendor: "azure",
        server: "s3",
        zonesRegions: [],
      },
      {
        display_name: "S4",
        vendor: "aws",
        server: "s4",
        zonesRegions: [],
      },
    ];

    const added = service.toggleCompare(true, {
      display_name: "S5",
      vendor: "gcp",
      server: "s5",
    });

    expect(added).toBeFalse();
    expect(service.selectedForCompare.length).toBe(4);
    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
        type: "warning",
        action: jasmine.objectContaining({
          label: "Register for free to unlock unlimited comparisons!",
          onClick: jasmine.any(Function),
        }),
      }),
    );
    const toastArg = show.calls.mostRecent().args[0] as {
      action?: { onClick: () => void };
    };
    toastArg.action?.onClick();
    expect(collectionsUi.promptRegisterForFeature).toHaveBeenCalled();
  });

  it("prompts registration from the guest database compare limit toast", () => {
    const toastService = TestBed.inject(ToastService);
    const show = spyOn(toastService, "show");
    const auth = TestBed.inject(AuthStateService);
    const collectionsUi = TestBed.inject(CollectionsUiService);
    spyOn(auth, "isAuthenticated").and.returnValue(false);
    service.selectedDatabases = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
      { display_name: "db-c", vendor: "azure", database: "db-c" },
      { display_name: "db-d", vendor: "aws", database: "db-d" },
    ];

    const added = service.toggleDatabaseCompare(true, {
      display_name: "db-e",
      vendor: "gcp",
      database: "db-e",
    });

    expect(added).toBeFalse();
    expect(service.selectedDatabases.length).toBe(4);
    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
        type: "warning",
        action: jasmine.objectContaining({
          label: "Register for free to unlock unlimited comparisons!",
          onClick: jasmine.any(Function),
        }),
      }),
    );
    const toastArg = show.calls.mostRecent().args[0] as {
      action?: { onClick: () => void };
    };
    toastArg.action?.onClick();
    expect(collectionsUi.promptRegisterForFeature).toHaveBeenCalled();
  });

  it("replaces database compare selection above guest limit without toasts", () => {
    const toastService = TestBed.inject(ToastService);
    const show = spyOn(toastService, "show");
    const selectionChanged = jasmine.createSpy("databaseSelectionChanged");
    service.databaseSelectionChanged.subscribe(selectionChanged);
    service.setBaselineDatabase({ vendor: "aws", database: "db-a" });
    const hydrated = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
      { display_name: "db-c", vendor: "azure", database: "db-c" },
      { display_name: "db-d", vendor: "aws", database: "db-d" },
      { display_name: "db-e", vendor: "gcp", database: "db-e" },
    ];

    service.replaceDatabaseCompareSelection(hydrated);

    expect(service.selectedDatabases).toEqual(hydrated);
    expect(selectionChanged).toHaveBeenCalledOnceWith(
      service.selectedDatabases,
    );
    expect(show).not.toHaveBeenCalled();
    expect(service.baselineDatabase).toEqual({
      vendor: "aws",
      database: "db-a",
    });
  });
});
