import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, computed, inject } from "@angular/core";
import type {
  EmailAddressResource,
  EmailCodeFactor,
  ExternalAccountResource,
  SessionWithActivitiesResource,
  UserResource,
} from "@clerk/shared/types";
import {
  AUTH_MESSAGES,
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_RETURN_PARAM,
  PROFILE_RETURN_VALUE,
} from "../auth.constants";
import type {
  ProfileNamePayload,
  ProfilePasswordPayload,
  ProfileResult,
  ProfileSession,
  ProfileSessionsResult,
  ProfileView,
  ReverifyCompleteResult,
  ReverifyResult,
} from "../auth.types";
import { authErrorMessage, isReverificationRequired } from "../auth.utils";
import { AuthStateService } from "./auth-state.service";
import { ClerkService } from "./clerk.service";

const AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

@Injectable({ providedIn: "root" })
export class ProfileService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly clerk = inject(ClerkService);
  private readonly auth = inject(AuthStateService);
  private readonly sessionResources = new Map<
    string,
    SessionWithActivitiesResource
  >();

  readonly profile = computed(() => this.toProfileView(this.auth.user()));

  updateName(payload: ProfileNamePayload): Promise<ProfileResult> {
    return this.run(AUTH_MESSAGES.unableToUpdateProfile, (user) =>
      user.update({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
      }),
    );
  }

  async setAvatar(file: File): Promise<ProfileResult> {
    if (!AVATAR_TYPES.has(file.type)) {
      return { status: "error", message: AUTH_MESSAGES.avatarInvalidType };
    }
    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      return { status: "error", message: AUTH_MESSAGES.avatarTooLarge };
    }
    return this.run(AUTH_MESSAGES.unableToUpdateAvatar, (user) =>
      user.setProfileImage({ file }),
    );
  }

  removeAvatar(): Promise<ProfileResult> {
    return this.run(AUTH_MESSAGES.unableToUpdateAvatar, (user) =>
      user.setProfileImage({ file: null }),
    );
  }

  async addEmail(email: string): Promise<ProfileResult> {
    const user = this.currentUser();
    if (!user) {
      return this.notReady();
    }

    try {
      const created = await user.createEmailAddress({ email: email.trim() });
      await created.prepareVerification({ strategy: "email_code" });
      await this.refresh(user);
      return { status: "verify", emailAddressId: created.id };
    } catch (error) {
      await this.refresh(user);
      return this.failure(error, AUTH_MESSAGES.unableToAddEmail);
    }
  }

  async resendEmailCode(emailAddressId: string): Promise<ProfileResult> {
    const result = await this.runOnEmail(
      emailAddressId,
      AUTH_MESSAGES.unableToResendVerification,
      (email) => email.prepareVerification({ strategy: "email_code" }),
    );
    return result.status === "complete"
      ? { status: "verify", emailAddressId }
      : result;
  }

  verifyEmail(emailAddressId: string, code: string): Promise<ProfileResult> {
    return this.runOnEmail(
      emailAddressId,
      AUTH_MESSAGES.unableToVerifyEmail,
      (email) => email.attemptVerification({ code: code.trim() }),
    );
  }

  setPrimaryEmail(emailAddressId: string): Promise<ProfileResult> {
    return this.run(AUTH_MESSAGES.unableToSetPrimaryEmail, (user) =>
      user.update({ primaryEmailAddressId: emailAddressId }),
    );
  }

  removeEmail(emailAddressId: string): Promise<ProfileResult> {
    return this.runOnEmail(
      emailAddressId,
      AUTH_MESSAGES.unableToRemoveEmail,
      (email) => email.destroy(),
    );
  }

  async connectGitHub(): Promise<ProfileResult> {
    const user = this.currentUser();
    if (!user) {
      return this.notReady();
    }

    try {
      const redirectUrl = this.profileReturnUrl();
      const existing = this.gitHubAccount(user);
      const account = existing
        ? await existing.reauthorize({ redirectUrl })
        : await user.createExternalAccount({
            strategy: "oauth_github",
            redirectUrl,
          });
      const target = account.verification?.externalVerificationRedirectURL;
      if (!target) {
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToConnectGitHub,
        };
      }
      window.location.assign(target.href);
      return { status: "redirecting" };
    } catch (error) {
      return this.failure(error, AUTH_MESSAGES.unableToConnectGitHub);
    }
  }

  disconnectGitHub(): Promise<ProfileResult> {
    return this.run(AUTH_MESSAGES.unableToDisconnectGitHub, async (user) => {
      const account = this.gitHubAccount(user);
      if (!account) {
        throw new Error(AUTH_MESSAGES.unableToDisconnectGitHub);
      }
      await account.destroy();
    });
  }

  updatePassword(payload: ProfilePasswordPayload): Promise<ProfileResult> {
    return this.run(AUTH_MESSAGES.unableToUpdatePassword, (user) =>
      user.updatePassword({
        newPassword: payload.newPassword,
        signOutOfOtherSessions: payload.signOutOfOtherSessions,
        ...(user.passwordEnabled
          ? { currentPassword: payload.currentPassword }
          : {}),
      }),
    );
  }

  async listSessions(): Promise<ProfileSessionsResult> {
    const user = this.currentUser();
    if (!user) {
      return this.notReady();
    }

    try {
      const currentId = this.clerk.session?.id ?? null;
      const active = (await user.getSessions()).filter(
        (session) => session.status === "active",
      );
      this.sessionResources.clear();
      active.forEach((session) =>
        this.sessionResources.set(session.id, session),
      );
      const sessions = active
        .map((session) => this.toProfileSession(session, currentId))
        .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
      return { status: "complete", sessions };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToLoadSessions),
      };
    }
  }

  async revokeSession(sessionId: string): Promise<ProfileResult> {
    const session = this.sessionResources.get(sessionId);
    if (!session) {
      return { status: "error", message: AUTH_MESSAGES.unableToRevokeSession };
    }

    try {
      await session.revoke();
      this.sessionResources.delete(sessionId);
      return { status: "complete" };
    } catch (error) {
      return this.failure(error, AUTH_MESSAGES.unableToRevokeSession);
    }
  }

  async deleteAccount(): Promise<ProfileResult> {
    const user = this.currentUser();
    if (!user) {
      return this.notReady();
    }

    this.auth.markAccountDeleted(true);
    try {
      await user.delete();
    } catch (error) {
      this.auth.markAccountDeleted(false);
      return this.failure(error, AUTH_MESSAGES.unableToDeleteAccount);
    }

    await this.clerk.clearActiveSession().catch(() => undefined);
    this.auth.refreshUser();
    return { status: "complete" };
  }

  async startReverification(): Promise<ReverifyResult> {
    const session = this.clerk.session;
    if (!session || !this.currentUser()) {
      return this.notReady();
    }

    try {
      const verification = await session.startVerification({
        level: "first_factor",
      });
      const factors = verification.supportedFirstFactors ?? [];
      if (factors.some((factor) => factor.strategy === "password")) {
        return { status: "password" };
      }

      const emailFactor = factors.find(
        (factor): factor is EmailCodeFactor => factor.strategy === "email_code",
      );
      if (!emailFactor) {
        return { status: "error", message: AUTH_MESSAGES.unableToReverify };
      }

      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });
      return { status: "code", emailAddress: emailFactor.safeIdentifier };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToReverify),
      };
    }
  }

  async completeReverification(
    payload: { password: string } | { code: string },
  ): Promise<ReverifyCompleteResult> {
    const session = this.clerk.session;
    if (!session) {
      return this.notReady();
    }

    try {
      const result = await session.attemptFirstFactorVerification(
        "password" in payload
          ? { strategy: "password", password: payload.password }
          : { strategy: "email_code", code: payload.code.trim() },
      );
      return result.status === "complete"
        ? { status: "complete" }
        : { status: "error", message: AUTH_MESSAGES.unableToReverify };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToReverify),
      };
    }
  }

  private async run(
    fallback: string,
    action: (user: UserResource) => Promise<unknown>,
  ): Promise<ProfileResult> {
    const user = this.currentUser();
    if (!user) {
      return this.notReady();
    }

    try {
      await action(user);
      await this.refresh(user);
      return { status: "complete" };
    } catch (error) {
      return this.failure(error, fallback);
    }
  }

  private runOnEmail(
    emailAddressId: string,
    fallback: string,
    action: (email: EmailAddressResource) => Promise<unknown>,
  ): Promise<ProfileResult> {
    return this.run(fallback, (user) => {
      const email = user.emailAddresses.find(
        (item) => item.id === emailAddressId,
      );
      if (!email) {
        throw new Error(fallback);
      }
      return action(email);
    });
  }

  private async refresh(user: UserResource): Promise<void> {
    await user.reload().catch(() => undefined);
    this.auth.refreshUser();
  }

  private failure(error: unknown, fallback: string): ProfileResult {
    if (isReverificationRequired(error)) {
      return { status: "reverify" };
    }
    return { status: "error", message: authErrorMessage(error, fallback) };
  }

  private currentUser(): UserResource | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.clerk.user;
  }

  private notReady(): { status: "error"; message: string } {
    return {
      status: "error",
      message: isPlatformBrowser(this.platformId)
        ? AUTH_MESSAGES.authNotReady
        : AUTH_MESSAGES.profileBrowserOnly,
    };
  }

  private gitHubAccount(user: UserResource): ExternalAccountResource | null {
    return (
      user.externalAccounts.find((account) => account.provider === "github") ??
      null
    );
  }

  private profileReturnUrl(): string {
    const url = new URL(window.location.href);
    url.searchParams.set(PROFILE_RETURN_PARAM, PROFILE_RETURN_VALUE);
    return url.href;
  }

  private toProfileView(user: UserResource | null): ProfileView | null {
    if (!user) {
      return null;
    }

    const github = this.gitHubAccount(user);
    const emails = user.emailAddresses
      .map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
        isPrimary: email.id === user.primaryEmailAddressId,
        isVerified: email.verification?.status === "verified",
      }))
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

    return {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      displayName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "",
      imageUrl: user.imageUrl ?? "",
      hasImage: !!user.hasImage,
      emails,
      github: github
        ? {
            label:
              github.username || github.emailAddress || github.providerUserId,
            isVerified: github.verification?.status === "verified",
            error:
              github.verification?.error?.longMessage ||
              github.verification?.error?.message ||
              "",
          }
        : null,
      passwordEnabled: user.passwordEnabled,
      showPasswordSection: user.passwordEnabled || !github,
      canDelete: user.deleteSelfEnabled !== false,
    };
  }

  private toProfileSession(
    session: SessionWithActivitiesResource,
    currentId: string | null,
  ): ProfileSession {
    const activity = session.latestActivity;
    return {
      id: session.id,
      browser:
        [activity?.browserName, activity?.browserVersion]
          .filter(Boolean)
          .join(" ") || "Unknown browser",
      device:
        activity?.deviceType || (activity?.isMobile ? "Mobile" : "Desktop"),
      isMobile: !!activity?.isMobile,
      location: [activity?.city, activity?.country].filter(Boolean).join(", "),
      ipAddress: activity?.ipAddress ?? "",
      lastActiveAt: session.lastActiveAt,
      isCurrent: session.id === currentId,
    };
  }
}
