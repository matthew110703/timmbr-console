export const strings = {
  metadata: {
    title: "Accept Invitation | Timmbr Console",
    description: "Set your administrative password to access Timmbr Console",
  },
  branding: {
    title: "Timmbr Console",
    subtitle: "Enterprise Administration",
    logoAlt: "Timmbr Console Logo",
  },
  title: "Set Password",
  subtitle:
    "Set a secure password to activate your administrative console access.",
  form: {
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    submitButton: "Activate Account",
    submittingButton: "Activating...",
  },
  validation: {
    passwordRequired: "Password is required",
    confirmPasswordRequired: "Please confirm your password",
    passwordFormat:
      "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character",
    passwordsDoNotMatch: "Passwords do not match",
  },
  validating: {
    loading: "Verifying invitation token...",
  },
  errors: {
    missingToken: "No invitation token was provided in the link.",
    invalidOrExpiredToken:
      "This invitation link is invalid or has expired. Please contact your administrator for a new invite.",
    expiredTitle: "Invitation Expired or Invalid",
    genericError: "An unexpected error occurred. Please try again.",
  },
  buttons: {
    backToLogin: "Return to Login",
  },
} as const;
