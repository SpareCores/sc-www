import { DatePipe, NgTemplateOutlet } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import {
  LucideCircleUser,
  LucideDynamicIcon,
  LucideMail,
  LucideMonitor,
  LucidePlus,
  LucideShield,
  LucideSmartphone,
} from "@lucide/angular";
import {
  AUTH_MESSAGES,
  AuthStateService,
  PROFILE_DELETE_CONFIRMATION,
  ProfileService,
  type ProfileResult,
  type ProfileSession,
} from "../../core/auth";
import { Button } from "../button/button";
import { LoadingSpinner } from "../loading-spinner/loading-spinner";

type ProfileTab = "account" | "security";
type ProfileSection =
  | "profile"
  | "emails"
  | "github"
  | "password"
  | "devices"
  | "delete";
type ProfileConfirm = { kind: "email" | "github" | "session"; id: string };
type ProfileEditor =
  | "name"
  | "email-add"
  | "email-verify"
  | "password"
  | "delete";
type ProfileFeedback = {
  section: ProfileSection;
  type: "error" | "info";
  message: string;
};
type ReverifyState =
  | { mode: "password" }
  | { mode: "code"; emailAddress: string };
type PendingReverify = {
  retry: () => Promise<void>;
  cancel: () => void;
};

const CONFIRM_SECTIONS: Record<ProfileConfirm["kind"], ProfileSection> = {
  email: "emails",
  github: "github",
  session: "devices",
};

@Component({
  selector: "sc-profile-modal",
  imports: [
    DatePipe,
    NgTemplateOutlet,
    FormsModule,
    Button,
    LucideCircleUser,
    LucideDynamicIcon,
    LucideMail,
    LucideMonitor,
    LucidePlus,
    LucideShield,
    LucideSmartphone,
    LoadingSpinner,
  ],
  templateUrl: "./profile-modal.html",
  styleUrls: ["../auth-modal.scss", "./profile-modal.scss"],
  host: { "(document:keydown.escape)": "close()" },
})
export class ProfileModal {
  protected readonly auth = inject(AuthStateService);
  private readonly profileService = inject(ProfileService);

  protected readonly profile = this.profileService.profile;
  protected readonly deleteConfirmationText = PROFILE_DELETE_CONFIRMATION;
  protected readonly messages = AUTH_MESSAGES;

  protected readonly tab = signal<ProfileTab>("account");
  protected readonly editor = signal<ProfileEditor | null>(null);
  protected readonly confirming = signal<ProfileConfirm | null>(null);
  protected readonly busy = signal<string | null>(null);
  protected readonly feedback = signal<ProfileFeedback | null>(null);
  protected readonly sessions = signal<ProfileSession[]>([]);
  protected readonly sessionsLoading = signal(false);
  protected readonly reverify = signal<ReverifyState | null>(null);
  protected readonly reverifyError = signal("");

  protected readonly firstName = signal("");
  protected readonly lastName = signal("");
  protected readonly newEmail = signal("");
  protected readonly emailCode = signal("");
  protected readonly verifyingEmailId = signal<string | null>(null);
  protected readonly currentPassword = signal("");
  protected readonly newPassword = signal("");
  protected readonly confirmPassword = signal("");
  protected readonly signOutOtherSessions = signal(true);
  protected readonly showPassword = signal(false);
  protected readonly deleteConfirmation = signal("");
  protected readonly reverifyPassword = signal("");
  protected readonly reverifyCode = signal("");

  private pendingReverify: PendingReverify | null = null;

  constructor() {
    effect(() => {
      if (!this.auth.profileModalOpen()) {
        this.reset();
      }
    });
  }

  protected close(): void {
    if (!this.auth.profileModalOpen() || this.busy()) {
      return;
    }
    this.auth.closeUserProfile();
  }

  protected selectTab(tab: ProfileTab): void {
    if (this.busy() || this.tab() === tab) {
      return;
    }
    this.closeEditor();
    this.tab.set(tab);
    if (tab === "security") {
      void this.loadSessions();
    }
  }

  protected openEditor(editor: ProfileEditor): void {
    if (this.busy()) {
      return;
    }
    const profile = this.profile();
    this.feedback.set(null);
    this.confirming.set(null);
    this.firstName.set(profile?.firstName ?? "");
    this.lastName.set(profile?.lastName ?? "");
    this.newEmail.set("");
    this.emailCode.set("");
    this.currentPassword.set("");
    this.newPassword.set("");
    this.confirmPassword.set("");
    this.signOutOtherSessions.set(true);
    this.showPassword.set(false);
    this.deleteConfirmation.set("");
    this.editor.set(editor);
  }

  protected closeEditor(): void {
    if (this.busy()) {
      return;
    }
    this.editor.set(null);
    this.confirming.set(null);
    this.verifyingEmailId.set(null);
    this.feedback.set(null);
  }

  protected isConfirming(kind: ProfileConfirm["kind"], id = ""): boolean {
    const target = this.confirming();
    return target?.kind === kind && target.id === id;
  }

  protected askConfirm(kind: ProfileConfirm["kind"], id = ""): void {
    if (this.busy()) {
      return;
    }
    this.feedback.set(null);
    this.editor.set(null);
    this.confirming.set({ kind, id });
  }

  protected cancelConfirm(): void {
    if (this.busy()) {
      return;
    }
    this.confirming.set(null);
  }

  protected async confirmAction(): Promise<void> {
    const target = this.confirming();
    if (!target) {
      return;
    }
    const result = await this.execute(
      CONFIRM_SECTIONS[target.kind],
      "confirm",
      () => this.confirmRequest(target),
    );
    if (result?.status !== "complete") {
      return;
    }
    this.confirming.set(null);
    if (target.kind === "session") {
      this.sessions.update((sessions) =>
        sessions.filter((session) => session.id !== target.id),
      );
    }
  }

  protected feedbackFor(section: ProfileSection): ProfileFeedback | null {
    const feedback = this.feedback();
    return feedback?.section === section ? feedback : null;
  }

  protected async saveName(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }
    const result = await this.execute("profile", "name", () =>
      this.profileService.updateName({
        firstName: this.firstName(),
        lastName: this.lastName(),
      }),
    );
    if (result?.status === "complete") {
      this.editor.set(null);
      this.showInfo("profile", AUTH_MESSAGES.profileUpdated);
    }
  }

  protected async uploadAvatar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (input) {
      input.value = "";
    }
    if (!file) {
      return;
    }
    await this.execute("profile", "avatar", () =>
      this.profileService.setAvatar(file),
    );
  }

  protected async removeAvatar(): Promise<void> {
    await this.execute("profile", "avatar", () =>
      this.profileService.removeAvatar(),
    );
  }

  protected async addEmail(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }
    const result = await this.execute("emails", "email-add", () =>
      this.profileService.addEmail(this.newEmail()),
    );
    if (result?.status === "verify") {
      this.startEmailVerification(result.emailAddressId);
    }
  }

  protected async verifyExistingEmail(emailAddressId: string): Promise<void> {
    const result = await this.execute("emails", "email-resend", () =>
      this.profileService.resendEmailCode(emailAddressId),
    );
    if (result?.status === "verify") {
      this.startEmailVerification(emailAddressId);
    }
  }

  protected async resendEmailCode(): Promise<void> {
    const emailAddressId = this.verifyingEmailId();
    if (!emailAddressId) {
      return;
    }
    const result = await this.execute("emails", "email-resend", () =>
      this.profileService.resendEmailCode(emailAddressId),
    );
    if (result?.status === "verify") {
      this.showInfo("emails", AUTH_MESSAGES.verificationCodeSent);
    }
  }

  protected async submitEmailCode(): Promise<void> {
    const emailAddressId = this.verifyingEmailId();
    if (!emailAddressId || !this.emailCode().trim()) {
      return;
    }
    const result = await this.execute("emails", "email-verify", () =>
      this.profileService.verifyEmail(emailAddressId, this.emailCode()),
    );
    if (result?.status === "complete") {
      this.editor.set(null);
      this.verifyingEmailId.set(null);
    }
  }

  protected async setPrimaryEmail(emailAddressId: string): Promise<void> {
    await this.execute("emails", "email-primary", () =>
      this.profileService.setPrimaryEmail(emailAddressId),
    );
  }

  protected async connectGitHub(): Promise<void> {
    await this.execute("github", "github-connect", () =>
      this.profileService.connectGitHub(),
    );
  }

  protected async savePassword(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.feedback.set({
        section: "password",
        type: "error",
        message: AUTH_MESSAGES.passwordMismatch,
      });
      return;
    }
    const result = await this.execute("password", "password", () =>
      this.profileService.updatePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
        signOutOfOtherSessions: this.signOutOtherSessions(),
      }),
    );
    if (result?.status === "complete") {
      this.editor.set(null);
      this.showInfo("password", AUTH_MESSAGES.passwordUpdated);
      void this.loadSessions();
    }
  }

  protected canDelete(): boolean {
    return this.deleteConfirmation() === PROFILE_DELETE_CONFIRMATION;
  }

  protected async deleteAccount(): Promise<void> {
    if (!this.canDelete()) {
      return;
    }
    await this.execute("delete", "delete", () =>
      this.profileService.deleteAccount(),
    );
  }

  protected async submitReverify(form: NgForm): Promise<void> {
    const state = this.reverify();
    if (!state || form.invalid || this.busy()) {
      return;
    }

    this.reverifyError.set("");
    this.busy.set("reverify");
    const result = await this.profileService.completeReverification(
      state.mode === "password"
        ? { password: this.reverifyPassword() }
        : { code: this.reverifyCode() },
    );
    this.busy.set(null);

    if (result.status === "error") {
      this.reverifyError.set(result.message);
      return;
    }

    const pending = this.pendingReverify;
    this.pendingReverify = null;
    this.clearReverify();
    await pending?.retry();
  }

  protected cancelReverify(): void {
    if (this.busy()) {
      return;
    }
    this.pendingReverify?.cancel();
    this.pendingReverify = null;
    this.clearReverify();
  }

  private async execute(
    section: ProfileSection,
    key: string,
    action: () => Promise<ProfileResult>,
  ): Promise<ProfileResult | null> {
    if (this.busy()) {
      return null;
    }

    this.feedback.set(null);
    this.busy.set(key);
    let result: ProfileResult;
    try {
      result = await action();
    } catch (error) {
      this.busy.set(null);
      throw error;
    }
    if (result.status !== "redirecting") {
      this.busy.set(null);
    }

    if (result.status === "reverify") {
      return new Promise((resolve) => {
        void this.startReverify(section, {
          retry: async () => resolve(await this.execute(section, key, action)),
          cancel: () => resolve(null),
        });
      });
    }

    if (result.status === "error") {
      this.feedback.set({ section, type: "error", message: result.message });
    }
    return result;
  }

  private async startReverify(
    section: ProfileSection,
    pending: PendingReverify,
  ): Promise<void> {
    this.busy.set("reverify");
    const result = await this.profileService.startReverification();
    this.busy.set(null);

    if (result.status === "error") {
      this.feedback.set({ section, type: "error", message: result.message });
      pending.cancel();
      return;
    }
    this.pendingReverify = pending;
    this.clearReverify();
    this.reverify.set(
      result.status === "password"
        ? { mode: "password" }
        : { mode: "code", emailAddress: result.emailAddress },
    );
  }

  private confirmRequest(target: ProfileConfirm): Promise<ProfileResult> {
    switch (target.kind) {
      case "email":
        return this.profileService.removeEmail(target.id);
      case "github":
        return this.profileService.disconnectGitHub();
      case "session":
        return this.profileService.revokeSession(target.id);
    }
  }

  private startEmailVerification(emailAddressId: string): void {
    this.confirming.set(null);
    this.verifyingEmailId.set(emailAddressId);
    this.emailCode.set("");
    this.editor.set("email-verify");
    this.showInfo("emails", AUTH_MESSAGES.emailVerificationSent);
  }

  private async loadSessions(): Promise<void> {
    this.sessionsLoading.set(true);
    const result = await this.profileService.listSessions();
    this.sessionsLoading.set(false);
    if (result.status === "error") {
      this.feedback.set({
        section: "devices",
        type: "error",
        message: result.message,
      });
      return;
    }
    this.sessions.set(result.sessions);
  }

  private clearReverify(): void {
    this.reverify.set(null);
    this.reverifyError.set("");
    this.reverifyPassword.set("");
    this.reverifyCode.set("");
  }

  private showInfo(section: ProfileSection, message: string): void {
    this.feedback.set({ section, type: "info", message });
  }

  private reset(): void {
    this.tab.set("account");
    this.editor.set(null);
    this.confirming.set(null);
    this.busy.set(null);
    this.feedback.set(null);
    this.sessions.set([]);
    this.verifyingEmailId.set(null);
    this.deleteConfirmation.set("");
    this.currentPassword.set("");
    this.newPassword.set("");
    this.confirmPassword.set("");
    this.pendingReverify?.cancel();
    this.pendingReverify = null;
    this.clearReverify();
  }
}
