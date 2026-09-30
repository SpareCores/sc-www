import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ClerkService } from "./clerk.service";

describe("ClerkService", () => {
  let router: { navigateByUrl: jasmine.Spy };

  function createService(): ClerkService {
    router = {
      navigateByUrl: jasmine.createSpy().and.resolveTo(true),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: "browser" },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.inject(ClerkService);
  }

  function setClerk(service: ClerkService, clerk: unknown): void {
    (service as unknown as { clerk: unknown }).clerk = clerk;
  }

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
});
