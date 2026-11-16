import { Dialog } from "@angular/cdk/dialog";
import { OverlayContainer } from "@angular/cdk/overlay";
import { WritableSignal, signal } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from "@angular/core/testing";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  ApiTokens,
  AuthState,
  Organizations,
  Profile,
  type ProfileOrganization,
  type ProfileView,
} from "../../../core/auth";
import { ProfileModal } from "./profile-modal";

describe("ProfileModal", () => {
  let fixture: ComponentFixture<ProfileModal>;
  let profileService: jasmine.SpyObj<Profile>;
  let apiTokens: jasmine.SpyObj<ApiTokens>;
  let switchTo: jasmine.Spy;
  let container: HTMLElement;
  const profileModalOpen = signal(true);
  const hasOrganizations = signal(false);
  const activeOrganization = signal<ProfileOrganization | null>(null);
  const isActiveAdmin = signal(false);
  const userImageUrl = signal("https://img.example/avatar.png");
  const acme: ProfileOrganization = {
    id: "org_1",
    name: "Acme",
    imageUrl: "",
    roleName: "Admin",
    isAdmin: true,
  };
  const closeUserProfile = jasmine.createSpy("closeUserProfile");
  const profile = signal<ProfileView | null>({
    firstName: "Jane",
    lastName: "Doe",
    displayName: "Jane Doe",
    imageUrl: "",
    hasImage: false,
    emails: [
      {
        id: "email_1",
        emailAddress: "jane@example.com",
        isPrimary: true,
        isVerified: true,
      },
    ],
    github: null,
    passwordEnabled: true,
    showPasswordSection: true,
    canDelete: true,
  });

  beforeEach(async () => {
    profileModalOpen.set(true);
    hasOrganizations.set(false);
    activeOrganization.set(null);
    isActiveAdmin.set(false);
    switchTo = jasmine
      .createSpy("switchTo")
      .and.resolveTo({ status: "complete" });
    apiTokens = jasmine.createSpyObj<ApiTokens>("ApiTokens", [
      "list",
      "create",
      "revoke",
    ]);
    apiTokens.list.and.resolveTo({
      status: "complete",
      user: [
        {
          id: "ak_1",
          name: "ci",
          owner: "user",
          createdAt: new Date("2026-11-01T00:00:00Z"),
          lastUsedAt: null,
          expiration: null,
          expired: false,
        },
      ],
      organizationId: null,
      organization: null,
      organizationError: "",
    });
    apiTokens.create.and.resolveTo({
      status: "complete",
      token: { name: "deploy", secret: "ak_secret", owner: "user" },
    });
    closeUserProfile.calls.reset();
    closeUserProfile.and.callFake(() => profileModalOpen.set(false));
    profileService = jasmine.createSpyObj<Profile>(
      "Profile",
      ["updateName", "listSessions"],
      { profile },
    );
    profileService.listSessions.and.resolveTo({
      status: "complete",
      sessions: [],
    });

    await TestBed.configureTestingModule({
      imports: [ProfileModal],
      providers: [
        ...sharedTestingProviders,
        {
          provide: AuthState,
          useValue: { profileModalOpen, closeUserProfile, userImageUrl },
        },
        { provide: Profile, useValue: profileService },
        { provide: ApiTokens, useValue: apiTokens },
        {
          provide: Organizations,
          useValue: {
            memberships: signal([acme]),
            hasOrganizations,
            active: activeOrganization,
            isActiveAdmin,
            switchTo,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileModal);
    fixture.detectChanges();
    container = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  function modal(): HTMLElement | null {
    return container.querySelector('[data-testid="profile-modal"]');
  }

  function query(testId: string): HTMLElement | null {
    return (
      modal()?.querySelector<HTMLElement>(`[data-testid="${testId}"]`) ?? null
    );
  }

  async function openTab(testId: string): Promise<void> {
    query(testId)?.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function pressEscape(): void {
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        keyCode: 27,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
  }

  it("opens the account tab in a dialog titled Edit profile", () => {
    expect(modal()?.querySelector("h2")?.textContent).toContain("Edit profile");
    expect(
      modal()?.querySelector('[data-testid="profile-emails"]')?.textContent,
    ).toContain("jane@example.com");
  });

  it("closes the profile on Escape", fakeAsync(() => {
    pressEscape();
    flush();

    expect(closeUserProfile).toHaveBeenCalled();
    expect(modal()).toBeNull();
  }));

  it("stays open on Escape while an action is running", fakeAsync(() => {
    const component = fixture.componentInstance as unknown as {
      busy: WritableSignal<string | null>;
    };
    component.busy.set("name");
    fixture.detectChanges();

    pressEscape();
    flush();

    expect(closeUserProfile).not.toHaveBeenCalled();
    expect(modal()).not.toBeNull();
  }));

  it("closes the dialog when the profile is closed elsewhere", fakeAsync(() => {
    profileModalOpen.set(false);
    fixture.detectChanges();
    flush();

    expect(modal()).toBeNull();
  }));

  it("loads active devices when the security tab opens", async () => {
    modal()
      ?.querySelector<HTMLButtonElement>('[data-testid="profile-tab-security"]')
      ?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(profileService.listSessions).toHaveBeenCalled();
    expect(
      modal()?.querySelector('[data-testid="profile-delete"]'),
    ).not.toBeNull();
  });

  it("disables the organization tab without organizations", () => {
    const tab = modal()?.querySelector<HTMLButtonElement>(
      '[data-testid="profile-tab-organization"]',
    );

    expect(tab?.disabled).toBeTrue();
    expect(tab?.getAttribute("aria-disabled")).toBe("true");
  });

  it("enables the organization tab for organization members", () => {
    hasOrganizations.set(true);
    fixture.detectChanges();

    expect(
      modal()?.querySelector<HTMLButtonElement>(
        '[data-testid="profile-tab-organization"]',
      )?.disabled,
    ).toBeFalse();
  });

  it("selects the API tokens tab", async () => {
    await openTab("profile-tab-tokens");

    expect(
      modal()
        ?.querySelector('[data-testid="profile-tab-tokens"]')
        ?.getAttribute("aria-selected"),
    ).toBe("true");
    expect(modal()?.querySelector('[data-testid="profile-emails"]')).toBeNull();
  });

  it("shows the personal account with the profile image", async () => {
    hasOrganizations.set(true);
    fixture.detectChanges();
    await openTab("profile-tab-organization");

    const current = query("profile-organization-current");
    expect(current?.textContent).toContain("Personal account");
    expect(current?.querySelector("img")?.getAttribute("src")).toBe(
      "https://img.example/avatar.png",
    );
  });

  it("switches to the selected organization", async () => {
    hasOrganizations.set(true);
    fixture.detectChanges();
    await openTab("profile-tab-organization");

    query("profile-organization-option")?.click();
    await fixture.whenStable();

    expect(switchTo).toHaveBeenCalledOnceWith("org_1");
  });

  it("lists personal API tokens", async () => {
    await openTab("profile-tab-tokens");

    expect(apiTokens.list).toHaveBeenCalledOnceWith(null);
    expect(query("profile-api-tokens-user")?.textContent).toContain("ci");
    expect(query("profile-api-tokens-organization")).toBeNull();
  });

  it("shows the load error instead of empty or pending token groups", async () => {
    apiTokens.list.and.resolveTo({
      status: "error",
      message: "Load failed.",
    });
    activeOrganization.set(acme);
    fixture.detectChanges();
    await openTab("profile-tab-tokens");

    const user = query("profile-api-tokens-user")?.textContent ?? "";
    const organization =
      query("profile-api-tokens-organization")?.textContent ?? "";
    expect(apiTokens.list).toHaveBeenCalledOnceWith("org_1");
    expect(user).toContain("Load failed.");
    expect(user).not.toContain("No API tokens yet.");
    expect(organization).toContain("Load failed.");
    expect(
      query("profile-api-tokens-organization")?.querySelector(
        "sc-loading-spinner",
      ),
    ).toBeNull();
  });

  it("reloads tokens when the active organization changes", async () => {
    await openTab("profile-tab-tokens");
    expect(apiTokens.list).toHaveBeenCalledTimes(1);

    activeOrganization.set(acme);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(apiTokens.list).toHaveBeenCalledTimes(2);
  });

  it("shows revoke errors next to the token", async () => {
    apiTokens.revoke.and.resolveTo({
      status: "error",
      message: "Revoke failed.",
    });
    await openTab("profile-tab-tokens");
    query("profile-api-token-revoke")?.click();
    fixture.detectChanges();

    Array.from(
      modal()?.querySelectorAll<HTMLButtonElement>(
        ".profile-modal__confirm button",
      ) ?? [],
    )
      .find((button) => button.textContent?.includes("Revoke"))
      ?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(apiTokens.revoke).toHaveBeenCalledOnceWith("ak_1");
    expect(query("profile-api-token-item")?.textContent).toContain(
      "Revoke failed.",
    );
  });

  it("creates a user API token and shows its secret", async () => {
    await openTab("profile-tab-tokens");
    query("profile-api-token-new")?.click();
    fixture.detectChanges();
    expect(query("profile-api-token-owner")).toBeNull();

    const component = fixture.componentInstance as unknown as {
      tokenName: { set(value: string): void };
      createToken(form: { invalid: boolean }): Promise<void>;
    };
    component.tokenName.set("deploy");
    await component.createToken({ invalid: false });
    fixture.detectChanges();

    expect(apiTokens.create).toHaveBeenCalledOnceWith({
      name: "deploy",
      secondsUntilExpiration: null,
      owner: "user",
    });
    expect(query("profile-api-token-secret")?.textContent).toContain(
      "ak_secret",
    );
  });

  it("offers organization ownership to admins of the active organization", async () => {
    activeOrganization.set(acme);
    isActiveAdmin.set(true);
    await openTab("profile-tab-tokens");

    query("profile-api-token-new")?.click();
    fixture.detectChanges();

    expect(query("profile-api-token-owner")?.textContent).toContain("Acme");
    expect(query("profile-api-tokens-organization")).not.toBeNull();
  });

  it("saves the updated name", async () => {
    profileService.updateName.and.resolveTo({ status: "complete" });
    modal()
      ?.querySelector<HTMLButtonElement>('[data-testid="profile-edit"]')
      ?.click();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      firstName: { set(value: string): void };
      saveName(form: { invalid: boolean }): Promise<void>;
    };
    component.firstName.set("Ada");
    await component.saveName({ invalid: false });

    expect(profileService.updateName).toHaveBeenCalledOnceWith({
      firstName: "Ada",
      lastName: "Doe",
    });
  });

  it("unlocks the modal when an action rejects", async () => {
    profileService.updateName.and.rejectWith(new Error("boom"));
    const component = fixture.componentInstance as unknown as {
      busy(): string | null;
      saveName(form: { invalid: boolean }): Promise<void>;
    };

    await expectAsync(component.saveName({ invalid: false })).toBeRejected();
    expect(component.busy()).toBeNull();
  });
});
