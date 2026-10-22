import { PLATFORM_ID, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AuthStateService } from "../core/auth";
import {
  CollectionsUiService,
  type PendingFeatureAction,
} from "./collections-ui.service";
import { CollectionsStore } from "./collections.store";
import {
  FEATURE_REGISTER_SUBTITLE,
  PENDING_FEATURE_ACTION_KEY,
} from "./collections.utils";

describe("CollectionsUiService", () => {
  let service: CollectionsUiService;
  let signUp: jasmine.Spy;
  let toggleFavoriteServer: jasmine.Spy;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;
  let authInProgress: ReturnType<typeof signal<boolean>>;
  let signUpModalOpen: ReturnType<typeof signal<boolean>>;
  let signInModalOpen: ReturnType<typeof signal<boolean>>;
  let isLoaded: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    sessionStorage.clear();
    isAuthenticated = signal(false);
    authInProgress = signal(false);
    signUpModalOpen = signal(false);
    signInModalOpen = signal(false);
    isLoaded = signal(false);
    signUp = jasmine.createSpy("signUp");
    toggleFavoriteServer = jasmine.createSpy("toggleFavoriteServer");

    TestBed.configureTestingModule({
      providers: [
        CollectionsUiService,
        { provide: PLATFORM_ID, useValue: "browser" },
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
            authInProgress: () => authInProgress(),
            signUpModalOpen: () => signUpModalOpen(),
            signInModalOpen: () => signInModalOpen(),
            signUp,
          },
        },
        {
          provide: CollectionsStore,
          useValue: {
            isLoaded: () => isLoaded(),
            isFavoriteServer: () => false,
            isFavoriteDatabase: () => false,
            isMutating: () => false,
            toggleFavoriteServer,
            toggleFavoriteDatabase: jasmine.createSpy("toggleFavoriteDatabase"),
            savedSearchByQuery: () => undefined,
          },
        },
      ],
    });

    service = TestBed.inject(CollectionsUiService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("opens sign-up with the feature subtitle", () => {
    service.promptRegisterForFeature();

    expect(signUp).toHaveBeenCalledWith({
      subtitle: FEATURE_REGISTER_SUBTITLE,
    });
    expect(sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY)).toBeNull();
  });

  it("persists a supplied pending feature action", () => {
    const action: PendingFeatureAction = {
      type: "favorite",
      kind: "server",
      vendorId: "aws",
      entityId: "t3.nano",
    };

    service.promptRegisterForFeature(action);

    expect(
      JSON.parse(sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY)!),
    ).toEqual(action);
    expect(signUp).toHaveBeenCalledWith({
      subtitle: FEATURE_REGISTER_SUBTITLE,
    });
  });

  it("clears a previous pending action when none is supplied", () => {
    sessionStorage.setItem(
      PENDING_FEATURE_ACTION_KEY,
      JSON.stringify({
        type: "open-save",
        target: "search-servers",
      }),
    );

    service.promptRegisterForFeature();

    expect(sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY)).toBeNull();
  });

  it("consumes a pending favorite once after authentication", async () => {
    const action: PendingFeatureAction = {
      type: "favorite",
      kind: "server",
      vendorId: "aws",
      entityId: "t3.nano",
    };
    service.promptRegisterForFeature(action);
    isLoaded.set(true);
    isAuthenticated.set(true);
    TestBed.flushEffects();
    await Promise.resolve();

    expect(toggleFavoriteServer).toHaveBeenCalledOnceWith({
      vendorId: "aws",
      serverId: "t3.nano",
    });
    expect(sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY)).toBeNull();
    expect(service.takePendingFeatureAction()).toBeNull();
  });

  it("clears pending feature state when registration is cancelled", async () => {
    service.promptRegisterForFeature({
      type: "favorite",
      kind: "server",
      vendorId: "aws",
      entityId: "t3.nano",
    });
    signUpModalOpen.set(true);
    TestBed.flushEffects();
    await Promise.resolve();

    signUpModalOpen.set(false);
    isAuthenticated.set(false);
    authInProgress.set(false);
    TestBed.flushEffects();
    await Promise.resolve();

    expect(sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY)).toBeNull();
  });
});
