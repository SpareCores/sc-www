import type { SignInResource, SignUpResource } from "@clerk/shared/types";
import {
  AUTH_MESSAGES,
  AUTH_POPUP_HEIGHT,
  AUTH_POPUP_WIDTH,
  NEWSLETTER_OPT_IN_KEY,
} from "./auth.constants";
import type { HostedNavAction } from "./auth.types";

export type ClerkAuthError = {
  message: string;
  paramName?: string;
};

export function clerkAuthError(
  error: unknown,
  fallback: string,
): ClerkAuthError {
  if (!error || typeof error !== "object") {
    return { message: fallback };
  }

  const errorWithList = error as {
    errors?: Array<{
      longMessage?: string;
      long_message?: string;
      message?: string;
      meta?: {
        paramName?: string;
        param_name?: string;
        name?: string;
      };
    }>;
    message?: string;
  };
  const first = errorWithList.errors?.[0];
  const message =
    first?.longMessage ||
    first?.long_message ||
    first?.message ||
    errorWithList.message ||
    fallback;
  const paramName =
    first?.meta?.paramName || first?.meta?.param_name || first?.meta?.name;

  return {
    message,
    paramName,
  };
}

export function authErrorMessage(error: unknown, fallback: string): string {
  return clerkAuthError(error, fallback).message;
}

export function getSessionFlag(key: string): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function setSessionFlag(key: string, enabled: boolean): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    if (enabled) {
      sessionStorage.setItem(key, "1");
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    return;
  }
}

export function appUrls(): { origin: string; authCallback: string } {
  const origin = window.location.origin;
  return {
    origin,
    authCallback: `${origin}/auth/callback`,
  };
}

export function isClerkAccountPortalUrl(url: string): boolean {
  return /accounts\.dev|accountsstage\.dev|#\/continue|protect-check/i.test(
    url,
  );
}

export function isAppOAuthCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      parsed.pathname.startsWith("/auth/callback")
    );
  } catch {
    return url.includes("/auth/callback");
  }
}

export function isSameOriginAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return url.startsWith("/") && !url.startsWith("//");
  }
}

export function resolveHostedNavAction(
  href: string,
  options: { blockSameOrigin: boolean },
): HostedNavAction {
  if (isClerkAccountPortalUrl(href)) {
    return "block";
  }
  if (isAppOAuthCallbackUrl(href)) {
    return "oauth";
  }
  if (options.blockSameOrigin && isSameOriginAppUrl(href)) {
    return "block";
  }
  return "forward";
}

const SECOND_FACTOR_STATUSES = new Set([
  "needs_second_factor",
  "needs_client_trust",
]);

export function isSecondFactorStatus(
  status: string | null | undefined,
): boolean {
  return !!status && SECOND_FACTOR_STATUSES.has(status);
}

export function isTransferable(
  resource:
    | (SignInResource & { isTransferable?: boolean })
    | (SignUpResource & { isTransferable?: boolean })
    | null
    | undefined,
): boolean {
  if (!resource) {
    return false;
  }
  if (resource.isTransferable === true) {
    return true;
  }

  const signUpExternal = (
    resource as SignUpResource & {
      verifications?: { externalAccount?: { status?: string | null } };
    }
  ).verifications?.externalAccount?.status;
  if (signUpExternal === "transferable") {
    return true;
  }

  const firstFactor = (
    resource as SignInResource & {
      firstFactorVerification?: { status?: string | null };
    }
  ).firstFactorVerification?.status;
  return firstFactor === "transferable";
}

export function signUpMissingFields(
  signUp: SignUpResource | null | undefined,
): string[] {
  return (
    (
      signUp as SignUpResource & {
        missingFields?: string[];
      }
    )?.missingFields ?? []
  );
}

export function signUpMissingPassword(
  signUp: SignUpResource | null | undefined,
): boolean {
  const missing = signUpMissingFields(signUp);
  return missing.includes("password");
}

export function pendingEmailVerification(
  signUp: SignUpResource | null | undefined,
): string | null {
  if (!signUp?.emailAddress) {
    return null;
  }

  const unverified =
    (
      signUp as SignUpResource & {
        unverifiedFields?: string[];
      }
    ).unverifiedFields ?? [];

  const needsEmail =
    unverified.includes("email_address") || unverified.includes("emailAddress");
  if (!needsEmail) {
    return null;
  }

  return signUp.emailAddress;
}

export function canResumeEmailVerification(
  signUp: SignUpResource | null | undefined,
  email: string,
): boolean {
  if (signUpMissingPassword(signUp) || needsLegalAcceptance(signUp)) {
    return false;
  }

  const pendingEmail = pendingEmailVerification(signUp);
  return !!pendingEmail && pendingEmail.toLowerCase() === email.toLowerCase();
}

export function isPendingGithubExternalComplete(
  signUp: SignUpResource | null | undefined,
): boolean {
  return signUp?.verifications?.externalAccount?.status === "verified";
}

export function needsLegalAcceptance(
  signUp: SignUpResource | null | undefined,
): boolean {
  return !!signUp && !signUp.legalAcceptedAt;
}

export function needsGithubConsent(
  signIn: SignInResource | null | undefined,
  signUp: SignUpResource | null | undefined,
  hasUser: boolean,
): boolean {
  if (hasUser) {
    return false;
  }

  if (isTransferable(signIn) || isTransferable(signUp)) {
    return false;
  }

  if (pendingEmailVerification(signUp)) {
    return false;
  }

  if (isPendingGithubExternalComplete(signUp) && needsLegalAcceptance(signUp)) {
    return true;
  }

  const missing = signUpMissingFields(signUp);
  return (
    missing.includes("legalAccepted") || missing.includes("legal_accepted")
  );
}

export function newsletterMetadata(
  newsletterOptIn: boolean,
): Record<string, unknown> | undefined {
  if (!newsletterOptIn) {
    return undefined;
  }

  return {
    [NEWSLETTER_OPT_IN_KEY]: true,
  };
}

export function prefersGithubRedirect(): boolean {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function openAuthPopup(name: string): Window {
  const width = AUTH_POPUP_WIDTH;
  const height = AUTH_POPUP_HEIGHT;
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - width) / 2),
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - height) / 2),
  );
  const popup = window.open(
    "about:blank",
    name,
    `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener=no`,
  );

  if (!popup) {
    throw new Error(AUTH_MESSAGES.githubPopupBlocked);
  }

  popup.focus();
  return popup;
}
