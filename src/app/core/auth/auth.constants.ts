export const CLERK_PUBLISHABLE_KEY =
  import.meta.env.NG_APP_CLERK_PUBLISHABLE_KEY || "";

export const WWW_API_BASE_URI =
  import.meta.env.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";

export const NEWSLETTER_OPT_IN_KEY = "newsletterOptIn";
export const NEWSLETTER_SUBSCRIBED_KEY = "newsletterSubscribed";
export const AUTH_PENDING_KEY = "scAuthPending";
export const GITHUB_SIGNIN_KEY = "scGithubSignIn";
export const GITHUB_POPUP_TIMEOUT_MS = 45_000;
export const AUTH_POPUP_WIDTH = 500;
export const AUTH_POPUP_HEIGHT = 700;
export const AUTH_OVERLAY_CLASS = "sc-auth-pending";
export const AUTH_OVERLAY_ID = "sc-auth-pending-overlay";

export const AUTH_MESSAGES = {
  defaultSignUpSubtitle:
    "Welcome! Please fill in the details to get started.",
  authUnavailable:
    "Auth server offline. Please contact support@sparecores.com for assistance.",
  authNotReady: "Authentication is not ready yet.",
  signInBrowserOnly: "Sign in is only available in the browser.",
  passwordResetBrowserOnly: "Password reset is only available in the browser.",
  registrationBrowserOnly: "Registration is only available in the browser.",
  additionalVerification: "Additional verification is required to sign in.",
  unableToSignIn: "Unable to sign in.",
  unableToSendResetCode: "Unable to send a password reset code.",
  unableToResetPassword: "Unable to reset your password.",
  unableToResendResetCode: "Unable to resend the password reset code.",
  unableToCreateAccount: "Unable to create your account.",
  unableToVerifyEmail: "Unable to verify your email address.",
  unableToResendVerification: "Unable to resend the verification code.",
  unableToCompleteGithubSignUp: "Unable to complete your GitHub sign-up.",
  githubPopupTimeout: "GitHub sign-in timed out. Try again or use email.",
  githubPopupCancelled: "GitHub sign-in was cancelled.",
  githubPopupBlocked: "Enable popups to continue with GitHub.",
  newsletterSuccess: "Yay, you've just subscribed to our newsletter!",
  newsletterError:
    "Couldn't subscribe to the newsletter. Try again later or contact us.",
} as const;
