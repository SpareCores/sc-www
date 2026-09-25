import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AuthStateService } from "../core/auth";
import { AnalyticsService } from "../services/analytics.service";
import { CollectionsService } from "./collections.service";
import { CollectionsStore } from "./collections.store";
import { favoriteServerId } from "./collections.types";

describe("CollectionsStore", () => {
  let store: InstanceType<typeof CollectionsStore>;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;
  let listFavoriteServers: jasmine.Spy;
  let listFavoriteDatabases: jasmine.Spy;
  let listSavedSearches: jasmine.Spy;
  let listSavedComparisons: jasmine.Spy;
  let listSavedAdvices: jasmine.Spy;
  let addFavoriteServer: jasmine.Spy;
  let deleteFavoriteServer: jasmine.Spy;
  let saveSearch: jasmine.Spy;
  let deleteSavedSearch: jasmine.Spy;
  let trackEvent: jasmine.Spy;

  beforeEach(() => {
    isAuthenticated = signal(false);
    const favoriteId = favoriteServerId("aws", "t3.nano");
    listFavoriteServers = jasmine
      .createSpy("listFavoriteServers")
      .and.returnValue(
        of([
          {
            id: favoriteId,
            vendor_id: "aws",
            server_id: "t3.nano",
          },
        ]),
      );
    listFavoriteDatabases = jasmine
      .createSpy("listFavoriteDatabases")
      .and.returnValue(of([]));
    listSavedSearches = jasmine
      .createSpy("listSavedSearches")
      .and.returnValue(of([]));
    listSavedComparisons = jasmine
      .createSpy("listSavedComparisons")
      .and.returnValue(of([]));
    listSavedAdvices = jasmine
      .createSpy("listSavedAdvices")
      .and.returnValue(of([]));
    addFavoriteServer = jasmine
      .createSpy("addFavoriteServer")
      .and.callFake(
        (vendorId: string, serverId: string, body: Record<string, unknown>) =>
          of({
            id: favoriteServerId(vendorId, serverId),
            vendor_id: vendorId,
            server_id: serverId,
            ...body,
          }),
      );
    deleteFavoriteServer = jasmine
      .createSpy("deleteFavoriteServer")
      .and.returnValue(of(undefined));
    saveSearch = jasmine
      .createSpy("saveSearch")
      .and.callFake((id: string, body: Record<string, unknown>) =>
        of({ id, ...body }),
      );
    deleteSavedSearch = jasmine
      .createSpy("deleteSavedSearch")
      .and.returnValue(of(undefined));
    trackEvent = jasmine.createSpy("trackEvent");

    TestBed.configureTestingModule({
      providers: [
        CollectionsStore,
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
            authInProgress: () => false,
            userId: () => (isAuthenticated() ? "user_test" : null),
          },
        },
        {
          provide: AnalyticsService,
          useValue: { trackEvent },
        },
        {
          provide: CollectionsService,
          useValue: {
            listFavoriteServers,
            listFavoriteDatabases,
            listSavedSearches,
            listSavedComparisons,
            listSavedAdvices,
            addFavoriteServer,
            deleteFavoriteServer,
            saveSearch,
            deleteSavedSearch,
          },
        },
      ],
    });

    store = TestBed.inject(CollectionsStore);
  });

  it("should be created", () => {
    expect(store).toBeTruthy();
  });

  it("starts empty while signed out", () => {
    expect(store.favoriteServers()).toEqual([]);
    expect(store.isLoaded()).toBeFalse();
    expect(listFavoriteServers).not.toHaveBeenCalled();
  });

  it("loads collections when authenticated with a user id", async () => {
    isAuthenticated.set(true);
    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(listFavoriteServers).toHaveBeenCalled();
    expect(store.isLoaded()).toBeTrue();
  });

  it("loads collections when loadAll is called", async () => {
    store.loadAll();
    await Promise.resolve();

    expect(listFavoriteServers).toHaveBeenCalled();
    expect(listFavoriteDatabases).toHaveBeenCalled();
    expect(listSavedSearches).toHaveBeenCalled();
    expect(listSavedComparisons).toHaveBeenCalled();
    expect(listSavedAdvices).toHaveBeenCalled();
    expect(store.favoriteServers()).toEqual([
      {
        id: favoriteServerId("aws", "t3.nano"),
        vendor_id: "aws",
        server_id: "t3.nano",
        note: undefined,
        order: undefined,
        bookmarked_at: undefined,
      },
    ]);
    expect(store.isLoaded()).toBeTrue();
    expect(store.isFavoriteServer("aws", "t3.nano")).toBeTrue();
    expect(store.isFavoriteServer("gcp", "e2-micro")).toBeFalse();
  });

  it("clears cached collections", async () => {
    store.loadAll();
    await Promise.resolve();
    store.clear();

    expect(store.favoriteServers()).toEqual([]);
    expect(store.isLoaded()).toBeFalse();
    expect(store.isFavoriteServer("aws", "t3.nano")).toBeFalse();
  });

  it("stores an error status when loading fails", async () => {
    listFavoriteServers.and.returnValue(
      throwError(() => new Error("network down")),
    );

    store.loadAll();
    await Promise.resolve();

    expect(store.isLoaded()).toBeFalse();
    expect(store.error()).toBe("network down");
  });

  it("tracks bookmark saved for a favorite server", async () => {
    store.toggleFavoriteServer({ vendorId: "aws", serverId: "t3.nano" });
    await Promise.resolve();

    expect(trackEvent).toHaveBeenCalledWith("bookmark saved", {
      target_url: "/server/aws/t3.nano",
    });
  });

  it("tracks bookmark deleted for a favorite server", async () => {
    store.loadAll();
    await Promise.resolve();
    trackEvent.calls.reset();

    store.toggleFavoriteServer({ vendorId: "aws", serverId: "t3.nano" });
    await Promise.resolve();

    expect(trackEvent).toHaveBeenCalledWith("bookmark deleted", {
      target_url: "/server/aws/t3.nano",
    });
  });

  it("tracks bookmark saved for a saved search with query target_url", async () => {
    store.saveSearch({
      page: "servers",
      query: { vendor_id: "foo" },
      name: "AWS servers",
    });
    await Promise.resolve();

    expect(trackEvent).toHaveBeenCalledWith("bookmark saved", {
      target_url: "/servers?vendor_id=foo",
    });
  });

  it("tracks bookmark deleted for a saved search", async () => {
    store.saveSearch({
      page: "servers",
      query: { vendor_id: "foo" },
      name: "AWS servers",
    });
    await Promise.resolve();
    const savedId = store.savedSearches()[0]?.id;
    expect(savedId).toBeTruthy();
    trackEvent.calls.reset();

    store.deleteSearch(savedId!);
    await Promise.resolve();

    expect(trackEvent).toHaveBeenCalledWith("bookmark deleted", {
      target_url: "/servers?vendor_id=foo",
    });
  });
});
