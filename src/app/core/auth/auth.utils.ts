import type { SignInResource, SignUpResource } from "@clerk/shared/types";
import {
  AUTH_MESSAGES,
  AUTH_POPUP_HEIGHT,
  AUTH_POPUP_WIDTH,
  NEWSLETTER_OPT_IN_KEY,
} from "./auth.constants";
import type { HostedNavAction } from "./auth.types";

export function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const errorWithList = error as {
      errors?: Array<{ longMessage?: string; message?: string }>;
      message?: string;
    };
    const longMessage = errorWithList.errors?.[0]?.longMessage;
    if (longMessage) {
      return longMessage;
    }

    const message =
      errorWithList.errors?.[0]?.message || errorWithList.message;
    if (message) {
      return message;
    }
  }

  return fallback;
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

export function isTransferable(
  resource:
    | (SignInResource & { isTransferable?: boolean })
    | (SignUpResource & { isTransferable?: boolean })
    | null
    | undefined,
): boolean {
  return resource?.isTransferable === true;
}

export function needsGithubConsent(
  signIn: SignInResource | null | undefined,
  signUp: SignUpResource | null | undefined,
  hasUser: boolean,
): boolean {
  if (hasUser) {
    return false;
  }

  const typedSignIn = signIn as
    | (SignInResource & { isTransferable?: boolean })
    | null
    | undefined;
  const typedSignUp = signUp as
    | (SignUpResource & {
        isTransferable?: boolean;
        missingFields?: string[];
      })
    | null
    | undefined;

  const firstFactorStatus = (
    typedSignIn as SignInResource & {
      firstFactorVerification?: { status?: string | null };
    }
  )?.firstFactorVerification?.status;

  if (
    isTransferable(typedSignIn) ||
    isTransferable(typedSignUp) ||
    firstFactorStatus === "transferable"
  ) {
    return true;
  }

  if (typedSignUp?.status === "missing_requirements") {
    return true;
  }

  const missing = typedSignUp?.missingFields ?? [];
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
