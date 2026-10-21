export type RegisterDetailsPayload = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
};

export type RegisterConsentPayload = {
  legalAccepted: boolean;
  newsletterOptIn: boolean;
};

export type RegisterResult =
  | { status: "complete" }
  | { status: "consent" }
  | { status: "verify" }
  | { status: "error"; message: string; param?: string };

export type LoginPayload = {
  emailAddress: string;
  password: string;
};

export type LoginResult =
  | { status: "complete" }
  | { status: "second_factor" }
  | { status: "error"; message: string };

export type PasswordResetResult =
  | { status: "code_sent" }
  | { status: "complete" }
  | { status: "error"; message: string };

export type ProfileResult =
  | { status: "complete" }
  | { status: "verify"; emailAddressId: string }
  | { status: "reverify" }
  | { status: "redirecting" }
  | { status: "error"; message: string };

export type ReverifyResult =
  | { status: "password" }
  | { status: "code"; emailAddress: string }
  | { status: "error"; message: string };

export type ReverifyCompleteResult =
  | { status: "complete" }
  | { status: "error"; message: string };

export type ProfileNamePayload = {
  firstName: string;
  lastName: string;
};

export type ProfilePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  signOutOfOtherSessions: boolean;
};

export type ProfileEmail = {
  id: string;
  emailAddress: string;
  isPrimary: boolean;
  isVerified: boolean;
};

export type ProfileGitHubAccount = {
  label: string;
  isVerified: boolean;
  error: string;
};

export type ProfileView = {
  firstName: string;
  lastName: string;
  displayName: string;
  imageUrl: string;
  hasImage: boolean;
  emails: ProfileEmail[];
  github: ProfileGitHubAccount | null;
  passwordEnabled: boolean;
  showPasswordSection: boolean;
  canDelete: boolean;
};

export type ProfileSession = {
  id: string;
  browser: string;
  device: string;
  isMobile: boolean;
  location: string;
  ipAddress: string;
  lastActiveAt: Date;
  isCurrent: boolean;
};

export type ProfileSessionsResult =
  | { status: "complete"; sessions: ProfileSession[] }
  | { status: "error"; message: string };

export type AuthKind = "login" | "registration";

export type GitHubIntent = "signIn" | "signUp";

export type GitHubCallbackResult =
  | { status: "authenticated" }
  | { status: "needs_consent" }
  | { status: "cancelled" }
  | { status: "error"; message: string };
