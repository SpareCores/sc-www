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
  signInTitle: "Sign in to Spare Cores",
  signingInTitle: "Signing in to your account",
  verifyDeviceTitle: "Verify this device",
  resetPasswordTitle: "Reset your password",
  setNewPasswordTitle: "Set a new password",
  createAccountTitle: "Create your account",
  creatingAccountTitle: "Creating your account",
  oneLastStepTitle: "One last step",
  verifyEmailTitle: "Verify your email",
  closeLoginModal: "Close login modal",
  closeRegisterModal: "Close register modal",
  welcomeBack: "Welcome back!",
  emailAddressLabel: "Email address",
  emailAddressPlaceholder: "Enter your email address",
  emailAddressInvalid: "Email address must be a valid email address.",
  passwordLabel: "Password",
  enterPasswordPlaceholder: "Enter your password",
  passwordTooShort: "Password must be at least 8 characters.",
  showPassword: "Show password",
  hidePassword: "Hide password",
  forgotPassword: "Forgot password?",
  continueButton: "Continue",
  continueWithGitHub: "Continue with GitHub",
  orDivider: "or",
  verifying: "Verifying...",
  noAccountPrompt: "Don't have an account?",
  registerLink: "Register!",
  backToSignIn: "Back to sign in",
  verificationCodeLabel: "Verification code",
  verificationCodePlaceholder: "Enter verification code",
  codeSentToSubtitle: (email: string) =>
    `Enter the verification code sent to ${email}.`,
  verifyButton: "Verify",
  resendCodeButton: "Resend code",
  resetRequestSubtitle:
    "Enter your email address and we'll send you a verification code.",
  backButton: "Back",
  sendCodeButton: "Send code",
  resetCodeSentToSubtitle: (email: string) =>
    `Enter the verification code sent to ${email} and choose a new password.`,
  newPasswordLabel: "New password",
  createNewPasswordPlaceholder: "Create a new password",
  resetPasswordButton: "Reset password",
  firstNameLabel: "First name",
  firstNamePlaceholder: "First name",
  lastNameLabel: "Last name",
  lastNamePlaceholder: "Last name",
  createPasswordPlaceholder: "Create a password",
  alreadyHaveAccountPrompt: "Already have an account?",
  logInLink: "Log in",
  consentSubtitle:
    "Accept the Terms of Service and Privacy Policy to finish signing up. Stay in the loop with the Spare Cores newsletter — optional, but recommended.",
  agreeToPrefix: "I agree to the",
  termsOfService: "Terms of Service",
  andConjunction: "and",
  privacyPolicy: "Privacy Policy",
  subscribeNewsletter: "Subscribe me to the Spare Cores newsletter",
  cancelButton: "Cancel",
  verifyEmailButton: "Verify email",
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
  emailRemoveWarning:
    "will be removed from this account and can no longer be used to sign in.",
  githubDisconnectWarning:
    "Your GitHub account will be disconnected and can no longer be used to sign in.",
  sessionRevokeWarning: "This device will be signed out of your account.",
  unknownBrowser: "Unknown browser",
  mobileDevice: "Mobile",
  desktopDevice: "Desktop",
} as const;
