import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AuthStateService } from "../core/auth";
import { CollectionsService } from "./collections.service";
import { CollectionsStore } from "./collections.store";
import { favoriteServerId } from "./collections.types";

describe("CollectionsStore", () => {
  let store: InstanceType<typeof CollectionsStore>;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;
  let authInProgress: ReturnType<typeof signal<boolean>>;
  let userId: ReturnType<typeof signal<string | null>>;
  let listFavoriteServers: jasmine.Spy;
  let listFavoriteDatabases: jasmine.Spy;
  let listSavedSearches: jasmine.Spy;
  let listSavedComparisons: jasmine.Spy;
  let listSavedAssessments: jasmine.Spy;

  beforeEach(() => {
    isAuthenticated = signal(false);
    authInProgress = signal(false);
    userId = signal<string | null>(null);
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
    listSavedAssessments = jasmine
      .createSpy("listSavedAssessments")
      .and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        CollectionsStore,
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
            authInProgress: () => authInProgress(),
            userId: () => userId(),
          },
        },
        {
          provide: CollectionsService,
          useValue: {
            listFavoriteServers,
            listFavoriteDatabases,
            listSavedSearches,
            listSavedComparisons,
            listSavedAssessments,
          },
        },
      ],
    });

    store = TestBed.inject(CollectionsStore);
  });

  async function flushAuthEffects(): Promise<void> {
    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
  }

  it("should be created", () => {
    expect(store).toBeTruthy();
  });

  it("starts empty while signed out", () => {
    expect(store.favoriteServers()).toEqual([]);
    expect(store.isLoaded()).toBeFalse();
    expect(listFavoriteServers).not.toHaveBeenCalled();
  });

  it("does not load while auth is in progress", async () => {
    authInProgress.set(true);
    isAuthenticated.set(true);
    userId.set("user_test");
    await flushAuthEffects();

    expect(listFavoriteServers).not.toHaveBeenCalled();
    expect(store.isLoaded()).toBeFalse();
  });

  it("loads collections when authenticated with a user id", async () => {
    isAuthenticated.set(true);
    userId.set("user_test");
    await flushAuthEffects();

    expect(listFavoriteServers).toHaveBeenCalled();
    expect(store.isLoaded()).toBeTrue();
  });

  it("loads collections only once for the same user id", async () => {
    isAuthenticated.set(true);
    userId.set("user_test");
    await flushAuthEffects();
    listFavoriteServers.calls.reset();

    userId.set("user_test");
    isAuthenticated.set(true);
    await flushAuthEffects();

    expect(listFavoriteServers).not.toHaveBeenCalled();
  });

  it("loads collections again when the user id changes", async () => {
    isAuthenticated.set(true);
    userId.set("user_a");
    await flushAuthEffects();
    listFavoriteServers.calls.reset();

    userId.set("user_b");
    await flushAuthEffects();

    expect(listFavoriteServers).toHaveBeenCalled();
  });

  it("clears collections on sign-out and loads for a later user", async () => {
    isAuthenticated.set(true);
    userId.set("user_a");
    await flushAuthEffects();
    expect(store.isLoaded()).toBeTrue();

    isAuthenticated.set(false);
    userId.set(null);
    await flushAuthEffects();

    expect(store.favoriteServers()).toEqual([]);
    expect(store.isLoaded()).toBeFalse();

    listFavoriteServers.calls.reset();
    isAuthenticated.set(true);
    userId.set("user_b");
    await flushAuthEffects();

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
    expect(listSavedAssessments).toHaveBeenCalled();
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
});
