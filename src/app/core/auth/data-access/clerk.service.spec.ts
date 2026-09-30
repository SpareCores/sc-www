import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ClerkService } from "./clerk.service";

describe("ClerkService", () => {
  function createService(): ClerkService {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: "browser" }],
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
});
