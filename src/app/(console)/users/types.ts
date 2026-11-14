export type UserRole = "USER" | "STAFF" | "ADMIN" | "MASTER";

export type UserStatus = "ACTIVE" | "DELETED";

export type OAuthType = "GOOGLE";

export const PERMISSIONS = {
  // Users (Customers & Staff)
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",

  // Admins (Assignable exclusively by Master)
  ADMINS_CREATE: "admins:create",
  ADMINS_UPDATE: "admins:update",

  // Orders
  ORDERS_READ: "orders:read",
  ORDERS_UPDATE: "orders:update",
  ORDERS_CANCEL: "orders:cancel",
  ORDERS_MESSAGE: "orders:message",
  ORDERS_DELIVER: "orders:deliver",

  // Catalog
  CATALOG_READ: "catalog:read",
  CATALOG_WRITE: "catalog:write",
  CATALOG_DELETE: "catalog:delete",

  // Transactions
  TRANSACTIONS_READ: "transactions:read",
  TRANSACTIONS_REFUND: "transactions:refund",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const MASTER_ONLY_PERMISSIONS: Permission[] = [
  PERMISSIONS.ADMINS_CREATE,
  PERMISSIONS.ADMINS_UPDATE,
];

export const STAFF_ASSIGNABLE_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.ORDERS_CANCEL,
  PERMISSIONS.ORDERS_MESSAGE,
  PERMISSIONS.ORDERS_DELIVER,
  PERMISSIONS.CATALOG_READ,
  PERMISSIONS.CATALOG_WRITE,
  PERMISSIONS.TRANSACTIONS_READ,
];

export interface PermissionDefinition {
  id: Permission;
  label: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  label: string;
  description: string;
  masterOnly?: boolean;
  permissions: PermissionDefinition[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "orders",
    label: "Orders Management",
    description: "Manage customer orders, shipments, delivery, and messaging",
    permissions: [
      {
        id: PERMISSIONS.ORDERS_READ,
        label: "View Orders",
        description: "View order lists, line items, and activity history",
      },
      {
        id: PERMISSIONS.ORDERS_UPDATE,
        label: "Update Orders",
        description: "Update status, shipment tracking, and delivery details",
      },
      {
        id: PERMISSIONS.ORDERS_CANCEL,
        label: "Cancel Orders",
        description: "Cancel pending or unfulfilled customer orders",
      },
      {
        id: PERMISSIONS.ORDERS_MESSAGE,
        label: "Message Customers",
        description: "Send status notifications and delivery communications",
      },
      {
        id: PERMISSIONS.ORDERS_DELIVER,
        label: "Mark Delivered",
        description: "Confirm companion and courier order deliveries",
      },
    ],
  },
  {
    id: "catalog",
    label: "Catalog Management",
    description: "Manage products, categories, brands, and product attributes",
    permissions: [
      {
        id: PERMISSIONS.CATALOG_READ,
        label: "View Catalog",
        description: "Browse products, categories, brands, and variants",
      },
      {
        id: PERMISSIONS.CATALOG_WRITE,
        label: "Create & Edit Catalog",
        description: "Create and update products, variants, and categories",
      },
      {
        id: PERMISSIONS.CATALOG_DELETE,
        label: "Delete Catalog Items",
        description: "Archive or delete products, categories, and brands",
      },
    ],
  },
  {
    id: "transactions",
    label: "Transactions & Payments",
    description: "Inspect customer payments and process refunds",
    permissions: [
      {
        id: PERMISSIONS.TRANSACTIONS_READ,
        label: "View Transactions",
        description: "View payment ledger, transaction statuses, and gateways",
      },
      {
        id: PERMISSIONS.TRANSACTIONS_REFUND,
        label: "Process Refunds",
        description: "Authorize and issue partial or full payment refunds",
      },
    ],
  },
  {
    id: "users",
    label: "User Management",
    description: "View and manage platform customers and operational staff",
    permissions: [
      {
        id: PERMISSIONS.USERS_READ,
        label: "View Users",
        description: "View customer, staff, and administrator directories",
      },
      {
        id: PERMISSIONS.USERS_CREATE,
        label: "Create Staff",
        description: "Provision operational staff accounts",
      },
      {
        id: PERMISSIONS.USERS_UPDATE,
        label: "Update Staff",
        description: "Update staff details, status, and assigned permissions",
      },
    ],
  },
  {
    id: "admins",
    label: "Administrator Management (Master Only)",
    description: "Manage high-privilege administrative console accounts",
    masterOnly: true,
    permissions: [
      {
        id: PERMISSIONS.ADMINS_CREATE,
        label: "Create Admins",
        description: "Provision new console administrator accounts",
      },
      {
        id: PERMISSIONS.ADMINS_UPDATE,
        label: "Update Admins",
        description: "Modify administrator details, roles, and permissions",
      },
    ],
  },
];

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  permissions: string[];
  status: UserStatus;
  emailVerified: boolean;
  linkedProviders: OAuthType[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword?: boolean;
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  role?: "ADMIN" | "STAFF";
  permissions?: string[];
}

export interface UpdateAdminUserPayload {
  name?: string;
  status?: UserStatus;
  role?: "ADMIN" | "STAFF";
  permissions?: string[];
}

export interface AdminCreateUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  status: UserStatus;
  createdAt: string;
  hasPassword?: boolean;
}
