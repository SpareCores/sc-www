import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { Auth } from "../services/auth/auth";
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

    TestBed.configureTestingModule({
      providers: [
        CollectionsStore,
        {
          provide: Auth,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
          },
        },
        {
          provide: CollectionsService,
          useValue: {
            listFavoriteServers,
            listFavoriteDatabases,
            listSavedSearches,
            listSavedComparisons,
            listSavedAdvices,
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
