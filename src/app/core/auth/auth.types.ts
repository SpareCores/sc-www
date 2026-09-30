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

export type AuthKind = "login" | "registration";

export type GitHubIntent = "signIn" | "signUp";

export type GitHubCallbackResult =
  | { status: "authenticated" }
  | { status: "needs_consent" }
  | { status: "cancelled" }
  | { status: "error"; message: string };
