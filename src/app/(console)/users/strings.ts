export const strings = {
  metadata: {
    title: "Users | Timmbr Console",
    description:
      "Inspect and manage platform customers, operational staff, and console administrators.",
  },
  header: {
    title: "Users",
    subtitle:
      "Inspect and manage platform customers, operational staff, and console administrators.",
    newUser: "Invite User",
  },
  tabs: {
    all: "All Users",
    customers: "Customers",
    staff: "Staff",
    admins: "Administrators",
  },
  toolbar: {
    searchPlaceholder: "Search users by name, email, or phone...",
    statusLabel: "Status",
    statusFilterAll: "All Statuses",
    clearFilters: "Clear Filters",
  },
  table: {
    user: "User",
    contact: "Contact",
    role: "Role",
    status: "Status",
    verified: "Verification",
    providers: "Auth Providers",
    lastLogin: "Last Login",
    createdAt: "Registered",
  },
  roleBadge: {
    USER: "Customer",
    STAFF: "Staff",
    ADMIN: "Admin",
    MASTER: "Master",
  },
  statusBadge: {
    ACTIVE: "Active",
    DELETED: "Deactivated",
  },
  verification: {
    verified: "Verified",
    unverified: "Unverified",
  },
  providers: {
    GOOGLE: "Google",
    PASSWORD: "Password",
  },
  badges: {
    pendingInvite: "Pending Invite",
  },
  actions: {
    resendInvite: "Resend Invite",
    resendingInvite: "Resending...",
  },
  empty: {
    title: "No users found",
    description: "There are currently no users registered in the system.",
    filteredDescription:
      "No users matched your current role, status, or search query.",
  },
  error: {
    title: "Failed to load users",
    description: "An unexpected error occurred while fetching users.",
  },
  placeholders: {
    notProvided: "—",
    never: "Never",
  },
  toasts: {
    fetchError: "Unable to load users. Please refresh the page.",
    createSuccess: "User invited successfully",
    createSuccessDesc:
      "An invitation email with a setup link will be sent to the user.",
    createError: "Failed to invite user",
    inviteSuccess: "User invited successfully",
    inviteSuccessDesc:
      "An invitation email with a setup link will be sent to the user.",
    inviteError: "Failed to invite user",
    resendSuccess: "Invitation resent successfully",
    resendSuccessDesc: "A fresh invitation email has been sent to the user.",
    resendError: "Failed to resend invitation",
    updateSuccess: "User updated successfully",
    updateSuccessDesc: "Account changes and permissions have been saved.",
    updateError: "Failed to update user",
  },
  validation: {
    nameRequired: "Full name is required",
    nameMin: "Full name must be at least 3 characters",
    nameMinUpdate: "Full name must be at least 2 characters",
    nameMax: "Full name must be at most 64 characters",
    emailRequired: "Email address is required",
    emailInvalid: "Please enter a valid email address",
    passwordRequired: "Password is required",
    passwordMin: "Password must be at least 8 characters long",
    passwordMax: "Password must not exceed 128 characters",
    passwordFormat:
      "Password must contain at least one uppercase letter, one number, and one special character",
    roleRequired: "Please select an account role",
  },
  createDialog: {
    title: "Invite User",
    description:
      "An invitation email with a setup link will be sent to the user.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Arjun Sharma",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g. arjun@timmbr.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter a strong password",
    roleLabel: "Account Role",
    roleStaff: "Staff (Operational)",
    roleAdmin: "Admin (Console Administrator)",
    permissionsTitle: "Assigned Permissions",
    permissionsDescription:
      "Configure granular operational and administrative privileges for this account.",
    cancel: "Cancel",
    submit: "Send Invitation",
    submitting: "Sending...",
  },
  detailsDrawer: {
    title: "User Profile & Access",
    description:
      "Inspect identity details, update status, and manage granular assigned permissions.",
    identitySection: "Account Identity",
    editableSection: "Settings & Access Control",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    roleLabel: "Account Role",
    statusLabel: "Account Status",
    statusActive: "Active",
    statusDeactivated: "Deactivated",
    lastLoginLabel: "Last Login",
    registeredLabel: "Member Since",
    verifiedLabel: "Email Verified",
    providersLabel: "Linked Authentication",
    permissionsTitle: "Granular Permissions",
    permissionsDescription:
      "Select the specific capabilities granted to this user across console modules.",
    selfNotice:
      "You are viewing your own profile. In accordance with security policy, administrators cannot modify their own role or permissions.",
    masterNotice:
      "This account has the Master role with unconditional system access. Its permissions cannot be modified.",
    customerNotice:
      "Customer accounts are managed via storefront authentication. Roles and permissions are not applicable; only account status can be modified.",
    cancel: "Close",
    save: "Save Changes",
    saving: "Saving...",
  },
  permissionMatrix: {
    selectAll: "Select All",
    deselectAll: "Deselect All",
    masterOnlyBadge: "Master Only",
    staffNotice:
      "Staff accounts are restricted to operational permissions across Orders, Catalog, and Transactions.",
    requiresPrefix: "Requires: ",
  },
  tooltips: {
    noInvitePermission:
      "You lack permission to invite operational staff or administrators.",
    noUpdatePermission:
      "You lack permission to modify this user account or its permissions.",
    adminsNeedUsersRead:
      "Admins management requires Users Read permission to be selected first.",
  },
} as const;

export type UsersPageStrings = typeof strings;
