export const CLERK_PUBLISHABLE_KEY =
  import.meta.env.NG_APP_CLERK_PUBLISHABLE_KEY || "";

export const WWW_API_BASE_URI =
  import.meta.env.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";

export const NEWSLETTER_OPT_IN_KEY = "newsletterOptIn";
export const NEWSLETTER_SUBSCRIBED_KEY = "newsletterSubscribed";
export const AUTH_OVERLAY_CLASS = "sc-auth-pending";
export const AUTH_OVERLAY_ID = "sc-auth-pending-overlay";
export const AUTH_REVALIDATION_COALESCE_MS = 400;

export const AUTH_MESSAGES = {
  defaultSignUpSubtitle: "Welcome! Please fill in the details to get started.",
  authUnavailable:
    "Auth server offline. Please contact support@sparecores.com for assistance.",
  authNotReady: "Authentication is not ready yet.",
  signInBrowserOnly: "Sign in is only available in the browser.",
  passwordResetBrowserOnly: "Password reset is only available in the browser.",
  registrationBrowserOnly: "Registration is only available in the browser.",
  additionalVerification: "Additional verification is required to sign in.",
  deviceTrustCodeSent:
    "We sent a verification code to your email to confirm this device.",
  unableToSignIn: "Unable to sign in.",
  unableToSendDeviceTrustCode: "Unable to send a verification code.",
  unableToVerifyDeviceTrust: "Unable to verify the code. Try again.",
  unableToResendDeviceTrustCode: "Unable to resend the verification code.",
  unableToSendResetCode: "Unable to send a password reset code.",
  unableToResetPassword: "Unable to reset your password.",
  unableToResendResetCode: "Unable to resend the password reset code.",
  unableToCreateAccount: "Unable to create your account.",
  unableToVerifyEmail: "Unable to verify your email address.",
  unableToResendVerification: "Unable to resend the verification code.",
  verificationCodeSent: "Code sent, check your emails!",
  unableToCompleteGitHubSignUp: "Unable to complete your GitHub sign-up.",
  newsletterSuccess: "Yay, you've just subscribed to our newsletter!",
  newsletterError:
    "Couldn't subscribe to the newsletter. Try again later or contact us.",
  unableToContinueGitHub: "Unable to continue with GitHub.",
  githubAuthorizationDenied:
    "Unable to continue with GitHub. Authorize Spare Cores to access your GitHub account to sign up or sign in.",
} as const;
