import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AuthStateService } from "../data-access/auth-state.service";
import { authGuard, blockLandingDuringAuthGuard } from "./auth.guard";

describe("auth guards", () => {
  let auth: {
    init: jasmine.Spy;
    isAuthenticated: jasmine.Spy;
    githubConsentActive: jasmine.Spy;
    authInProgress: jasmine.Spy;
    startAuthPending: jasmine.Spy;
  };

  function setup(platformId: "browser" | "server" = "browser"): void {
    auth = {
      init: jasmine.createSpy("init").and.resolveTo(),
      isAuthenticated: jasmine
        .createSpy("isAuthenticated")
        .and.returnValue(false),
      githubConsentActive: jasmine
        .createSpy("githubConsentActive")
        .and.returnValue(false),
      authInProgress: jasmine
        .createSpy("authInProgress")
        .and.returnValue(false),
      startAuthPending: jasmine.createSpy("startAuthPending"),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: AuthStateService, useValue: auth },
      ],
    });
  }

  function run(guard: CanActivateFn) {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  describe("authGuard", () => {
    it("allows navigation during SSR without initializing auth", async () => {
      setup("server");

      expect(await run(authGuard)).toBeTrue();
      expect(auth.init).not.toHaveBeenCalled();
    });

    it("allows signed-in users after auth initializes", async () => {
      setup();
      auth.isAuthenticated.and.returnValue(true);

      expect(await run(authGuard)).toBeTrue();
      expect(auth.init).toHaveBeenCalled();
    });

    it("redirects guests to the landing page", async () => {
      setup();

      const result = await run(authGuard);

      expect(result instanceof UrlTree).toBeTrue();
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe("/");
    });
  });

  describe("blockLandingDuringAuthGuard", () => {
    it("keeps the auth pending state while an auth flow is running", () => {
      setup();
      auth.authInProgress.and.returnValue(true);

      expect(run(blockLandingDuringAuthGuard)).toBeTrue();
      expect(auth.startAuthPending).toHaveBeenCalled();
    });

    it("does nothing when no auth flow is running", () => {
      setup();

      expect(run(blockLandingDuringAuthGuard)).toBeTrue();
      expect(auth.startAuthPending).not.toHaveBeenCalled();
    });

    it("does nothing during GitHub consent", () => {
      setup();
      auth.authInProgress.and.returnValue(true);
      auth.githubConsentActive.and.returnValue(true);

      expect(run(blockLandingDuringAuthGuard)).toBeTrue();
      expect(auth.startAuthPending).not.toHaveBeenCalled();
    });

    it("does nothing during SSR", () => {
      setup("server");
      auth.authInProgress.and.returnValue(true);

      expect(run(blockLandingDuringAuthGuard)).toBeTrue();
      expect(auth.startAuthPending).not.toHaveBeenCalled();
    });
  });
});
