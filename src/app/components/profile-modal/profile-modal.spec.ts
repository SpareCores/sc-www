import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import {
  AuthStateService,
  ProfileService,
  type ProfileView,
} from "../../core/auth";
import { ProfileModal } from "./profile-modal";

describe("ProfileModal", () => {
  let fixture: ComponentFixture<ProfileModal>;
  let profileService: jasmine.SpyObj<ProfileService>;
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
    profileService = jasmine.createSpyObj<ProfileService>(
      "ProfileService",
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
          provide: AuthStateService,
          useValue: { profileModalOpen, closeUserProfile },
        },
        { provide: ProfileService, useValue: profileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileModal);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  it("should create and show the account tab", () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(
      element().querySelector('[data-testid="profile-emails"]')?.textContent,
    ).toContain("jane@example.com");
  });

  it("closes on Escape", () => {
    closeUserProfile.calls.reset();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(closeUserProfile).toHaveBeenCalled();
  });

  it("loads active devices when the security tab opens", async () => {
    element()
      .querySelector<HTMLButtonElement>('[data-testid="profile-tab-security"]')
      ?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(profileService.listSessions).toHaveBeenCalled();
    expect(
      element().querySelector('[data-testid="profile-delete"]'),
    ).not.toBeNull();
  });

  it("saves the updated name", async () => {
    profileService.updateName.and.resolveTo({ status: "complete" });
    element()
      .querySelector<HTMLButtonElement>('[data-testid="profile-edit"]')
      ?.click();
    fixture.detectChanges();

    const modal = fixture.componentInstance as unknown as {
      firstName: { set(value: string): void };
      saveName(form: { invalid: boolean }): Promise<void>;
    };
    modal.firstName.set("Ada");
    await modal.saveName({ invalid: false });

    expect(profileService.updateName).toHaveBeenCalledOnceWith({
      firstName: "Ada",
      lastName: "Doe",
    });
  });

  it("unlocks the modal when an action rejects", async () => {
    profileService.updateName.and.rejectWith(new Error("boom"));
    const modal = fixture.componentInstance as unknown as {
      busy(): string | null;
      saveName(form: { invalid: boolean }): Promise<void>;
    };

    await expectAsync(modal.saveName({ invalid: false })).toBeRejected();
    expect(modal.busy()).toBeNull();
  });
});
