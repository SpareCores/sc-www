import type { Clerk } from "@clerk/clerk-js";

export type ClerkWithNavigation = Clerk & {
  __internal_windowNavigate: (url: URL | string) => void;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  legalAccepted: boolean;
  newsletterOptIn: boolean;
};

export type RegisterResult =
  | { status: "complete" }
  | { status: "verify" }
  | { status: "error"; message: string };

export type LoginPayload = {
  emailAddress: string;
  password: string;
};

export type LoginResult =
  | { status: "complete" }
  | { status: "error"; message: string };

export type PasswordResetResult =
  | { status: "code_sent" }
  | { status: "complete" }
  | { status: "error"; message: string };

export type GithubCallbackOutcome = "authenticated" | "consent" | "error";

export type HostedNavAction = "block" | "oauth" | "forward";
