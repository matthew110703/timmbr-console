"use client";

import * as React from "react";
import type { UserProfile } from "@/types/auth";
import {
  type Permission,
  hasPermission,
  hasAnyPermission,
  isMasterUser,
} from "@/lib/auth/permissions";

interface AuthContextValue {
  user: UserProfile | null;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export interface AuthProviderProps {
  user: UserProfile | null;
  children: React.ReactNode;
}

export function AuthProvider({ user, children }: AuthProviderProps) {
  const value = React.useMemo(() => ({ user }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthUser(): UserProfile | null {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthUser must be used within an AuthProvider");
  }
  return context.user;
}

export function useIsMaster(): boolean {
  const user = useAuthUser();
  return isMasterUser(user);
}

export function usePermission(perm: Permission): boolean {
  const user = useAuthUser();
  return hasPermission(user, perm);
}

export function useAnyPermission(perms: readonly Permission[]): boolean {
  const user = useAuthUser();
  return hasAnyPermission(user, perms);
}
