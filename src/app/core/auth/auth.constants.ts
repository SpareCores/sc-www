export const CLERK_PUBLISHABLE_KEY =
  import.meta.env.NG_APP_CLERK_PUBLISHABLE_KEY || "";

export const WWW_API_BASE_URI =
  import.meta.env.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";

export const NEWSLETTER_OPT_IN_KEY = "newsletterOptIn";
export const NEWSLETTER_SUBSCRIBED_KEY = "newsletterSubscribed";
export const AUTH_OVERLAY_CLASS = "sc-auth-pending";
export const AUTH_OVERLAY_ID = "sc-auth-pending-overlay";
export const PROFILE_RETURN_PARAM = "profile";
export const PROFILE_RETURN_VALUE = "connected";
export const PROFILE_AVATAR_MAX_BYTES = 10 * 1024 * 1024;
export const PROFILE_DELETE_CONFIRMATION = "Delete account";

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
  profileBrowserOnly: "Profile changes are only available in the browser.",
  unableToUpdateProfile: "Unable to update your profile.",
  profileUpdated: "Your profile has been updated.",
  avatarInvalidType: "Upload a JPG, PNG, GIF or WEBP image.",
  avatarTooLarge: "The image must be smaller than 10 MB.",
  unableToUpdateAvatar: "Unable to update your profile image.",
  unableToAddEmail: "Unable to add the email address.",
  unableToRemoveEmail: "Unable to remove the email address.",
  unableToSetPrimaryEmail: "Unable to set the primary email address.",
  emailVerificationSent: "We sent a verification code to the new address.",
  unableToConnectGitHub: "Unable to connect your GitHub account.",
  unableToDisconnectGitHub: "Unable to disconnect your GitHub account.",
  unableToUpdatePassword: "Unable to update your password.",
  passwordUpdated: "Your password has been updated.",
  passwordMismatch: "Passwords don't match.",
  unableToLoadSessions: "Unable to load your active devices.",
  unableToRevokeSession: "Unable to sign out the device.",
  unableToDeleteAccount: "Unable to delete your account.",
  unableToReverify: "Unable to verify your identity. Try again.",
} as const;
