export const CONSOLE_PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  ADMINS_CREATE: "admins:create",
  ADMINS_UPDATE: "admins:update",
  ORDERS_READ: "orders:read",
  ORDERS_UPDATE: "orders:update",
  ORDERS_CANCEL: "orders:cancel",
  ORDERS_MESSAGE: "orders:message",
  ORDERS_DELIVER: "orders:deliver",
  CATALOG_READ: "catalog:read",
  CATALOG_WRITE: "catalog:write",
  CATALOG_DELETE: "catalog:delete",
  TRANSACTIONS_READ: "transactions:read",
  TRANSACTIONS_REFUND: "transactions:refund",
} as const;

export type Permission =
  (typeof CONSOLE_PERMISSIONS)[keyof typeof CONSOLE_PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] =
  Object.values(CONSOLE_PERMISSIONS);

export const PERMISSION_DEPENDENCIES: Partial<
  Record<Permission, readonly Permission[]>
> = {
  [CONSOLE_PERMISSIONS.USERS_CREATE]: [CONSOLE_PERMISSIONS.USERS_READ],
  [CONSOLE_PERMISSIONS.USERS_UPDATE]: [CONSOLE_PERMISSIONS.USERS_READ],
  [CONSOLE_PERMISSIONS.ADMINS_CREATE]: [CONSOLE_PERMISSIONS.USERS_READ],
  [CONSOLE_PERMISSIONS.ADMINS_UPDATE]: [CONSOLE_PERMISSIONS.USERS_READ],
  [CONSOLE_PERMISSIONS.ORDERS_UPDATE]: [CONSOLE_PERMISSIONS.ORDERS_READ],
  [CONSOLE_PERMISSIONS.ORDERS_CANCEL]: [CONSOLE_PERMISSIONS.ORDERS_READ],
  [CONSOLE_PERMISSIONS.ORDERS_MESSAGE]: [CONSOLE_PERMISSIONS.ORDERS_READ],
  [CONSOLE_PERMISSIONS.ORDERS_DELIVER]: [
    CONSOLE_PERMISSIONS.ORDERS_READ,
    CONSOLE_PERMISSIONS.ORDERS_UPDATE,
  ],
  [CONSOLE_PERMISSIONS.CATALOG_WRITE]: [CONSOLE_PERMISSIONS.CATALOG_READ],
  [CONSOLE_PERMISSIONS.CATALOG_DELETE]: [CONSOLE_PERMISSIONS.CATALOG_READ],
  [CONSOLE_PERMISSIONS.TRANSACTIONS_REFUND]: [
    CONSOLE_PERMISSIONS.TRANSACTIONS_READ,
  ],
};

export type AuthUserLike =
  | {
      role?: string | null;
      permissions?: readonly string[] | null;
    }
  | null
  | undefined;

export function isMasterUser(user: AuthUserLike): boolean {
  return user?.role === "MASTER";
}

export function hasPermission(user: AuthUserLike, perm: Permission): boolean {
  if (!user) return false;
  if (isMasterUser(user)) return true;
  return Array.isArray(user.permissions) && user.permissions.includes(perm);
}

export function hasAnyPermission(
  user: AuthUserLike,
  perms: readonly Permission[],
): boolean {
  if (!user) return false;
  if (isMasterUser(user)) return true;
  if (!Array.isArray(user.permissions)) return false;
  return perms.some((p) => user.permissions?.includes(p));
}

export function getMissingDependencies(
  perm: Permission,
  selected: readonly string[],
): Permission[] {
  const deps = PERMISSION_DEPENDENCIES[perm];
  if (!deps || deps.length === 0) return [];
  const selectedSet = new Set(selected);
  return deps.filter((dep) => !selectedSet.has(dep));
}

export function cascadeDeselectPermission(
  perm: Permission,
  selected: readonly string[],
): string[] {
  const toRemove = new Set<string>([perm]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const item of selected) {
      if (!toRemove.has(item)) {
        const deps = PERMISSION_DEPENDENCIES[item as Permission];
        if (deps && deps.some((dep) => toRemove.has(dep))) {
          toRemove.add(item);
          changed = true;
        }
      }
    }
  }

  return selected.filter((item) => !toRemove.has(item));
}

export function canAccessRoute(user: AuthUserLike, pathname: string): boolean {
  if (!user) return false;
  if (isMasterUser(user)) return true;

  const normalized = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  if (normalized === "/overview" || normalized.startsWith("/overview/")) {
    return user.role === "ADMIN" || user.role === "MASTER";
  }

  if (
    normalized === "/products/new" ||
    normalized.startsWith("/products/new/")
  ) {
    return hasPermission(user, CONSOLE_PERMISSIONS.CATALOG_WRITE);
  }

  if (
    normalized === "/products" ||
    normalized.startsWith("/products/") ||
    normalized === "/categories" ||
    normalized.startsWith("/categories/") ||
    normalized === "/brands" ||
    normalized.startsWith("/brands/") ||
    normalized === "/attributes" ||
    normalized.startsWith("/attributes/")
  ) {
    return hasPermission(user, CONSOLE_PERMISSIONS.CATALOG_READ);
  }

  if (normalized === "/orders" || normalized.startsWith("/orders/")) {
    return hasPermission(user, CONSOLE_PERMISSIONS.ORDERS_READ);
  }

  if (
    normalized === "/transactions" ||
    normalized.startsWith("/transactions/")
  ) {
    return hasPermission(user, CONSOLE_PERMISSIONS.TRANSACTIONS_READ);
  }

  if (normalized === "/users" || normalized.startsWith("/users/")) {
    return hasPermission(user, CONSOLE_PERMISSIONS.USERS_READ);
  }

  return false;
}
