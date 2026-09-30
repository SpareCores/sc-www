import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AuthFlowStore } from "./auth-flow-store.service";

describe("AuthFlowStore", () => {
  function createStore(): AuthFlowStore {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: "browser" }],
    });
    return TestBed.inject(AuthFlowStore);
  }

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("keeps pending state, GitHub intent, and a safe return URL in one record", () => {
    const store = createStore();

    store.rememberReturnUrl("/servers?tab=1#list");
    store.setGitHubIntent("signIn");
    store.setPending(true);

    expect(store.pending()).toBeTrue();
    expect(store.githubIntent()).toBe("signIn");
    expect(JSON.parse(sessionStorage.getItem("scAuthFlow") ?? "{}")).toEqual({
      pending: true,
      returnUrl: "/servers?tab=1#list",
      githubIntent: "signIn",
    });
    expect(store.peekReturnUrl()).toBe("/servers?tab=1#list");
    expect(store.consumeReturnUrl()).toBe("/servers?tab=1#list");
    expect(store.peekReturnUrl()).toBeNull();
    expect(store.pending()).toBeTrue();
    expect(store.githubIntent()).toBe("signIn");
  });

  it("does not replace the original URL from the callback page and rejects unsafe URLs", () => {
    const store = createStore();

    store.rememberReturnUrl("/servers?tab=1#list");
    store.rememberReturnUrl("/auth/callback?intent=signIn");

    expect(store.consumeReturnUrl()).toBe("/servers?tab=1#list");

    store.rememberReturnUrl("//evil.example");
    store.rememberReturnUrl("https://evil.example");

    expect(store.peekReturnUrl()).toBeNull();
    expect(store.consumeReturnUrl()).toBe("/");
  });

  it("drops invalid persisted values", () => {
    sessionStorage.setItem(
      "scAuthFlow",
      JSON.stringify({
        pending: true,
        returnUrl: "https://evil.example",
        githubIntent: "nope",
      }),
    );

    const store = createStore();

    expect(store.pending()).toBeTrue();
    expect(store.githubIntent()).toBeNull();
    expect(store.peekReturnUrl()).toBeNull();
    expect(store.consumeReturnUrl()).toBe("/");
  });

  it("clears the flow record from one cleanup path", () => {
    const store = createStore();
    store.rememberReturnUrl("/servers");
    store.setPending(true);
    store.setGitHubIntent("signUp");

    store.clear();

    expect(store.pending()).toBeFalse();
    expect(store.githubIntent()).toBeNull();
    expect(sessionStorage.getItem("scAuthFlow")).toBeNull();
  });
});
