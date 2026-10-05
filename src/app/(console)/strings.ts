export const strings = {
  branding: {
    title: "Timmbr Console",
    subtitle: "Commerce Control Plane",
    logoAlt: "Timmbr Logo",
  },
  nav: {
    overview: "Overview",
    catalog: "Catalog",
    products: "Products",
    categories: "Categories",
    brands: "Brands",
    orders: "Orders",
    inventory: "Inventory",
    customers: "Customers",
  },
  header: {
    administration: "Administration",
    logout: "Logout",
  },
  profile: {
    viewProfile: "View Profile",
    logout: "Logout",
    logoutErrorTitle: "Logout failed",
    logoutErrorDescription: "Unable to complete logout. Please try again.",
    dialog: {
      title: "Account Profile",
      description:
        "Administrative account credentials and system identity details.",
      close: "Close",
      fields: {
        id: "Account ID",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        role: "Role",
        status: "Email Verification",
        verified: "Verified",
        unverified: "Unverified",
        lastLogin: "Last Login",
        createdAt: "Member Since",
        updatedAt: "Last Activity",
        notProvided: "Not provided",
        never: "Never",
      },
    },
  },
  footer: {
    docs: "Documentation",
    support: "Help & Support",
  },
} as const;

export type ConsoleLayoutStrings = typeof strings;
