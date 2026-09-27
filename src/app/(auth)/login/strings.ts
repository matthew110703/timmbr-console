export const strings = {
  metadata: {
    title: "Sign In | Timmbr Console",
    description: "Sign in to access the Timmbr administrative console",
  },
  branding: {
    title: "Timmbr Console",
    subtitle: "Enterprise Administration",
    logoAlt: "Timmbr Console Logo",
  },
  title: "Login",
  subtitle: "Please enter your administrative credentials to continue.",
  form: {
    emailLabel: "Email address",
    emailPlaceholder: "admin@timmbr.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submitButton: "Login",
    submittingButton: "Logging in...",
  },
  validation: {
    emailRequired: "Email address is required",
    emailInvalid: "Please enter a valid email address",
    passwordRequired: "Password is required",
    passwordFormat:
      "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character",
  },
  errors: {
    genericError: "An unexpected error occurred. Please try again.",
    networkError: "Unable to connect to the authentication server.",
    unauthorizedAccess:
      "Access denied. Only administrators and master accounts can access the Timmbr Console.",
  },
} as const;
