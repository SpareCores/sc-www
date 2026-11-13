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
import { AuthState, Profile, type ProfileView } from "../../../core/auth";
import { ProfileModal } from "./profile-modal";

describe("ProfileModal", () => {
  let fixture: ComponentFixture<ProfileModal>;
  let profileService: jasmine.SpyObj<Profile>;
  let container: HTMLElement;
  const profileModalOpen = signal(true);
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
          useValue: { profileModalOpen, closeUserProfile },
        },
        { provide: Profile, useValue: profileService },
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
