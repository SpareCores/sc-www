import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ClerkClient } from "./clerk-client";

describe("ClerkClient", () => {
  let router: { navigateByUrl: jasmine.Spy };

  function createService(): ClerkClient {
    router = {
      navigateByUrl: jasmine.createSpy().and.resolveTo(true),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "browser" },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.inject(ClerkClient);
  }

  function setClerk(
    service: ClerkClient,
    clerk: unknown,
    initResolved = true,
  ): void {
    const target = service as unknown as {
      clerk: unknown;
      initPromise: Promise<void> | null;
    };
    target.clerk = clerk;
    target.initPromise = initResolved ? Promise.resolve() : null;
  }

  function createServerService(): ClerkClient {
    router = {
      navigateByUrl: jasmine.createSpy().and.resolveTo(true),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "server" },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.inject(ClerkClient);
  }

  it("does not initialize Clerk outside the browser", async () => {
    const service = createServerService();

    await service.init();

    expect(service.isLoaded()).toBeFalse();
    expect(service.instance).toBeNull();
  });

  it("returns null token outside the browser", async () => {
    const service = createServerService();

    await expectAsync(service.getToken()).toBeResolvedTo(null);
  });

  it("returns the active session token in the browser", async () => {
    const service = createService();
    const getToken = jasmine
      .createSpy("getToken")
      .and.resolveTo("session-token");
    setClerk(service, { session: { getToken } });

    await expectAsync(service.getToken()).toBeResolvedTo("session-token");
    expect(getToken).toHaveBeenCalledWith(undefined);
  });

  it("returns null token when there is no active session", async () => {
    const service = createService();
    setClerk(service, { session: null });

    await expectAsync(service.getToken()).toBeResolvedTo(null);
  });

  it("returns null token when session token retrieval fails", async () => {
    const service = createService();
    const getToken = jasmine
      .createSpy("getToken")
      .and.rejectWith(new Error("token failed"));
    setClerk(service, { session: { getToken } });

    await expectAsync(service.getToken()).toBeResolvedTo(null);
  });

  it("returns null token when Clerk fails to load", async () => {
    const service = createService();
    const target = service as unknown as {
      initPromise: Promise<void> | null;
    };
    target.initPromise = Promise.reject(new Error("load failed"));

    await expectAsync(service.getToken()).toBeResolvedTo(null);
  });

  it("passes Force redirect URLs when afterAuthUrl is set", async () => {
    const service = createService();
    const handleRedirectCallback = jasmine.createSpy().and.resolveTo();
    setClerk(service, { handleRedirectCallback });
    const afterAuthUrl = "https://example.com/servers?tab=1#list";

    await service.handleRedirectCallback({
      transferable: false,
      origin: "https://example.com",
      afterAuthUrl,
    });

    expect(handleRedirectCallback).toHaveBeenCalledWith(
      jasmine.objectContaining({
        signInForceRedirectUrl: afterAuthUrl,
        signUpForceRedirectUrl: afterAuthUrl,
        transferable: false,
      }),
      jasmine.any(Function),
    );
    const options = handleRedirectCallback.calls.mostRecent().args[0] as Record<
      string,
      unknown
    >;
    expect(options["signInFallbackRedirectUrl"]).toBeUndefined();
    expect(options["signUpFallbackRedirectUrl"]).toBeUndefined();
  });

  it("omits Force redirect URLs when afterAuthUrl is absent", async () => {
    const service = createService();
    const handleRedirectCallback = jasmine.createSpy().and.resolveTo();
    setClerk(service, { handleRedirectCallback });

    await service.handleRedirectCallback({
      transferable: true,
      origin: "https://example.com",
    });

    const options = handleRedirectCallback.calls.mostRecent().args[0] as Record<
      string,
      unknown
    >;
    expect(options["signInForceRedirectUrl"]).toBeUndefined();
    expect(options["signUpForceRedirectUrl"]).toBeUndefined();
    expect(options["signInFallbackRedirectUrl"]).toBeUndefined();
    expect(options["signUpFallbackRedirectUrl"]).toBeUndefined();
    expect(options["transferable"]).toBeTrue();
  });

  it("routes same-origin redirects through Angular Router", async () => {
    const service = createService();
    const absoluteSameOrigin = `${window.location.origin}/servers?tab=1#list`;

    await (
      service as unknown as {
        navigateRouter(url: string, replace?: boolean): Promise<boolean>;
      }
    ).navigateRouter(absoluteSameOrigin);

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith(
      "/servers?tab=1#list",
      undefined,
    );

    await (
      service as unknown as {
        navigateRouter(url: string, replace?: boolean): Promise<boolean>;
      }
    ).navigateRouter("/servers?tab=2", true);

    expect(router.navigateByUrl).toHaveBeenCalledWith("/servers?tab=2", {
      replaceUrl: true,
    });
  });

  it("clears the active session", async () => {
    const service = createService();
    const setActive = jasmine.createSpy("setActive").and.resolveTo(undefined);
    setClerk(service, { setActive });

    await service.clearActiveSession();

    expect(setActive).toHaveBeenCalledOnceWith({ session: null });
  });
  describe("lazy SDK loading", () => {
    type ClerkModule = typeof import("@clerk/clerk-js");
    type LoaderInternals = {
      importClerk: () => Promise<ClerkModule>;
      loadClerk: (publishableKey?: string) => Promise<void>;
    };

    afterEach(() => {
      delete (window as Window & { Clerk?: unknown }).Clerk;
    });

    function loader(service: ClerkClient): LoaderInternals {
      return service as unknown as LoaderInternals;
    }

    it("imports, constructs and loads the SDK", async () => {
      const service = createService();
      const load = jasmine.createSpy("load").and.resolveTo(undefined);
      const constructed: string[] = [];
      class FakeClerk {
        load = load;
        constructor(key: string) {
          constructed.push(key);
        }
      }
      const importClerk = spyOn(loader(service), "importClerk").and.resolveTo({
        Clerk: FakeClerk,
      } as unknown as ClerkModule);

      await loader(service).loadClerk("pk_test");

      expect(importClerk).toHaveBeenCalledTimes(1);
      expect(constructed).toEqual(["pk_test"]);
      expect(load).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ telemetry: false }),
      );
      expect(service.isLoaded()).toBeTrue();
    });

    it("reports not loaded until the SDK has finished loading", async () => {
      const service = createService();
      let finishLoading: () => void = () => undefined;
      class FakeClerk {
        load = () =>
          new Promise<void>((resolve) => {
            finishLoading = resolve;
          });
      }
      spyOn(loader(service), "importClerk").and.resolveTo({
        Clerk: FakeClerk,
      } as unknown as ClerkModule);

      const loading = loader(service).loadClerk("pk_test");
      await new Promise((resolve) => setTimeout(resolve));

      expect(service.isLoaded()).toBeFalse();

      finishLoading();
      await loading;

      expect(service.isLoaded()).toBeTrue();
    });

    it("skips the import when the publishable key is missing", async () => {
      const service = createService();
      const importClerk = spyOn(loader(service), "importClerk");
      spyOn(console, "error");

      await loader(service).loadClerk("");

      expect(importClerk).not.toHaveBeenCalled();
      expect(service.isLoaded()).toBeFalse();
    });

    it("stays unloaded when the SDK chunk fails to load", async () => {
      const service = createService();
      spyOn(loader(service), "importClerk").and.rejectWith(
        new Error("chunk failed"),
      );

      await expectAsync(loader(service).loadClerk("pk_test")).toBeRejected();

      expect(service.isLoaded()).toBeFalse();
      expect(service.instance).toBeNull();
    });
  });
});
