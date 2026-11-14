"use client";

import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Inline,
  Input,
  Select,
  Stack,
  Text,
  Tooltip,
  toast,
} from "@timmbr/ui";
import { formatDateTime } from "@/app/(console)/orders/lib/formatMoney";
import { strings } from "@/app/(console)/users/strings";
import {
  STAFF_ASSIGNABLE_PERMISSIONS,
  type AdminUserListItem,
  type UserRole,
  type UserStatus,
} from "@/app/(console)/users/types";
import {
  useAuthUser,
  useIsMaster,
  usePermission,
} from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import { PermissionMatrix } from "./PermissionMatrix";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

export interface UserDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserListItem | null;
  onSuccess: () => void;
  callerId?: string;
  isCallerMaster?: boolean;
}

const ROLE_OPTIONS = [
  { value: "STAFF", label: strings.createDialog.roleStaff },
  { value: "ADMIN", label: strings.createDialog.roleAdmin },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: strings.detailsDrawer.statusActive },
  { value: "DELETED", label: strings.detailsDrawer.statusDeactivated },
];

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

interface DrawerContentInnerProps {
  user: AdminUserListItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  callerId?: string;
  isCallerMaster?: boolean;
}

const UserDetailsDrawerContent: React.FC<DrawerContentInnerProps> = ({
  user,
  onOpenChange,
  onSuccess,
  callerId,
  isCallerMaster = false,
}) => {
  const authUser = useAuthUser();
  const isMasterHook = useIsMaster();
  const isMaster = Boolean(isCallerMaster || isMasterHook);
  const canUpdateUsers = usePermission(CONSOLE_PERMISSIONS.USERS_UPDATE);
  const canUpdateAdmins = usePermission(CONSOLE_PERMISSIONS.ADMINS_UPDATE);
  const canCreateUsers = usePermission(CONSOLE_PERMISSIONS.USERS_CREATE);
  const canCreateAdmins = usePermission(CONSOLE_PERMISSIONS.ADMINS_CREATE);

  const effectiveCallerId = callerId || authUser?.id;
  const isSelf = Boolean(effectiveCallerId && user.id === effectiveCallerId);
  const isTargetMaster = user.role === "MASTER";
  const isCustomer = user.role === "USER";

  const isPendingInvite = user.role !== "USER" && user.hasPassword === false;

  const canEditTarget =
    isMaster || (user.role === "ADMIN" ? canUpdateAdmins : canUpdateUsers);

  const canResendInvite =
    isPendingInvite &&
    (isMaster || (user.role === "ADMIN" ? canCreateAdmins : canCreateUsers));

  const [name, setName] = useState(user.name || "");
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [role, setRole] = useState<"ADMIN" | "STAFF">(
    user.role === "ADMIN" ? "ADMIN" : "STAFF",
  );
  const [permissions, setPermissions] = useState<string[]>(
    user.permissions || [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendInvite = async () => {
    setIsResending(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/resend-invite`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || strings.toasts.resendError);
      }

      toast.success(
        strings.toasts.resendSuccess,
        strings.toasts.resendSuccessDesc,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.toasts.resendError);
    } finally {
      setIsResending(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};

      if (!isCustomer && name.trim() !== (user.name || "")) {
        payload.name = name.trim();
      }

      if (status !== user.status) {
        payload.status = status;
      }

      if (!isSelf && !isTargetMaster && !isCustomer) {
        if (role !== user.role) {
          payload.role = role;
        }

        // Compare permissions
        const currentPerms = new Set(user.permissions || []);
        const newPerms = new Set(permissions);
        const isPermsChanged =
          currentPerms.size !== newPerms.size ||
          [...newPerms].some((p) => !currentPerms.has(p));

        if (isPermsChanged) {
          payload.permissions = permissions;
        }
      }

      if (Object.keys(payload).length === 0) {
        onOpenChange(false);
        return;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || strings.toasts.updateError);
      }

      toast.success(
        strings.toasts.updateSuccess,
        strings.toasts.updateSuccessDesc,
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.toasts.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = getInitials(user.name, user.email);

  return (
    <DrawerContent
      side="right"
      className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden"
    >
      <DrawerHeader className="p-6 border-b border-border/40 shrink-0">
        <Inline gap={3} align="center">
          <Avatar initials={initials} size="md" />
          <Stack gap={1} className="min-w-0 flex-1">
            <DrawerTitle className="truncate">
              {user.name || strings.placeholders.notProvided}
            </DrawerTitle>
            <DrawerDescription className="truncate">
              {user.email}
            </DrawerDescription>
            <Inline gap={2} align="center" className="pt-1">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
              {isPendingInvite && (
                <Badge variant="warning" size="sm">
                  {strings.badges.pendingInvite}
                </Badge>
              )}
            </Inline>
          </Stack>
        </Inline>
      </DrawerHeader>

      <DrawerBody className="flex-1 min-h-0 overflow-y-auto mx-0 px-6 py-6 space-y-6">
        {error && (
          <Alert variant="destructive" title={strings.toasts.updateError}>
            <Text
              variant="caption"
              className="text-destructive-foreground mt-1"
            >
              {error}
            </Text>
          </Alert>
        )}

        {isSelf && (
          <Alert variant="info" title="Self-Account Notice">
            <Text variant="caption" className="mt-1">
              {strings.detailsDrawer.selfNotice}
            </Text>
          </Alert>
        )}

        {isTargetMaster && (
          <Alert variant="warning" title="Master Account">
            <Text variant="caption" className="mt-1">
              {strings.detailsDrawer.masterNotice}
            </Text>
          </Alert>
        )}

        {/* ── Read-only Identity Attributes ── */}
        <Card
          variant="subtle"
          className="p-5 border border-border/50 bg-muted/20 rounded-lg"
        >
          <Stack gap={4}>
            <Text variant="body-2" className="font-semibold text-foreground">
              {strings.detailsDrawer.identitySection}
            </Text>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Text variant="caption" foreground="muted">
                  {strings.detailsDrawer.phoneLabel}
                </Text>
                <Text variant="body-3" className="font-mono mt-1">
                  {user.phone || strings.placeholders.notProvided}
                </Text>
              </div>

              <div>
                <Text variant="caption" foreground="muted">
                  {strings.detailsDrawer.verifiedLabel}
                </Text>
                <div className="mt-1">
                  <Badge
                    variant={user.emailVerified ? "success" : "subtle"}
                    size="sm"
                  >
                    {user.emailVerified
                      ? strings.verification.verified
                      : strings.verification.unverified}
                  </Badge>
                </div>
              </div>

              <div>
                <Text variant="caption" foreground="muted">
                  {strings.detailsDrawer.registeredLabel}
                </Text>
                <Text variant="body-3" className="mt-1">
                  {formatDateTime(user.createdAt)}
                </Text>
              </div>

              <div>
                <Text variant="caption" foreground="muted">
                  {strings.detailsDrawer.lastLoginLabel}
                </Text>
                <Text variant="body-3" className="mt-1">
                  {user.lastLoginAt
                    ? formatDateTime(user.lastLoginAt)
                    : strings.placeholders.never}
                </Text>
              </div>
            </div>

            <div className="pt-3 border-t border-border/30">
              <Text variant="caption" foreground="muted">
                {strings.detailsDrawer.providersLabel}
              </Text>
              <Inline gap={1.5} wrap className="mt-1.5">
                {user.linkedProviders && user.linkedProviders.length > 0 ? (
                  user.linkedProviders.map((p) => (
                    <Badge key={p} variant="outline" size="sm">
                      {strings.providers[p] ?? p}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" size="sm">
                    {strings.providers.PASSWORD}
                  </Badge>
                )}
              </Inline>
            </div>
          </Stack>
        </Card>

        {/* ── Settings & Access Control ── */}
        <Stack gap={4}>
          <Text variant="body-2" className="font-semibold text-foreground">
            {strings.detailsDrawer.editableSection}
          </Text>

          {isCustomer ? (
            <Stack gap={4}>
              <Select
                containerClassName="w-full"
                label={strings.detailsDrawer.statusLabel}
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={(val) => setStatus(val as UserStatus)}
                disabled={!canEditTarget}
              />
              <Card
                variant="subtle"
                className="p-4 border border-border/50 bg-muted/20 rounded-lg"
              >
                <Text variant="caption" foreground="muted">
                  {strings.detailsDrawer.customerNotice}
                </Text>
              </Card>
            </Stack>
          ) : (
            <>
              <Input
                label={strings.detailsDrawer.nameLabel}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isTargetMaster || !canEditTarget}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  containerClassName="w-full"
                  label={strings.detailsDrawer.statusLabel}
                  options={STATUS_OPTIONS}
                  value={status}
                  onValueChange={(val) => setStatus(val as UserStatus)}
                  disabled={isTargetMaster || isSelf || !canEditTarget}
                />

                <Select
                  containerClassName="w-full"
                  label={strings.detailsDrawer.roleLabel}
                  options={ROLE_OPTIONS}
                  value={role}
                  onValueChange={(val) => {
                    const nextRole = val as "STAFF" | "ADMIN";
                    setRole(nextRole);
                    if (nextRole === "STAFF") {
                      setPermissions((prev) =>
                        prev.filter((p) =>
                          STAFF_ASSIGNABLE_PERMISSIONS.includes(
                            p as Permission,
                          ),
                        ),
                      );
                    }
                  }}
                  disabled={isTargetMaster || isSelf || !canEditTarget}
                />
              </div>

              <Stack gap={3} className="pt-4 border-t border-border/40">
                <Stack gap={1}>
                  <Text
                    variant="body-2"
                    className="font-semibold text-foreground"
                  >
                    {strings.detailsDrawer.permissionsTitle}
                  </Text>
                  <Text variant="caption" foreground="muted">
                    {strings.detailsDrawer.permissionsDescription}
                  </Text>
                </Stack>

                <PermissionMatrix
                  selectedPermissions={permissions}
                  onChange={setPermissions}
                  targetRole={role as UserRole}
                  isCallerMaster={isMaster}
                  disabled={isTargetMaster || isSelf || !canEditTarget}
                />
              </Stack>
            </>
          )}
        </Stack>
      </DrawerBody>

      <DrawerFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 shrink-0">
        <Inline gap={2} justify="between" align="center" className="w-full">
          <div>
            {canResendInvite && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResendInvite}
                loading={isResending}
                disabled={isSaving}
              >
                {isResending
                  ? strings.actions.resendingInvite
                  : strings.actions.resendInvite}
              </Button>
            )}
          </div>
          <Inline gap={2} align="center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isResending}
            >
              {strings.detailsDrawer.cancel}
            </Button>
            {!isTargetMaster &&
              (!canEditTarget ? (
                <Tooltip content={strings.tooltips.noUpdatePermission}>
                  <span className="inline-flex">
                    <Button type="button" disabled>
                      {strings.detailsDrawer.save}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isResending}
                >
                  {isSaving
                    ? strings.detailsDrawer.saving
                    : strings.detailsDrawer.save}
                </Button>
              ))}
          </Inline>
        </Inline>
      </DrawerFooter>
    </DrawerContent>
  );
};

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess,
  callerId,
  isCallerMaster = false,
}) => {
  if (!user) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <UserDetailsDrawerContent
        key={user.id}
        user={user}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        callerId={callerId}
        isCallerMaster={isCallerMaster}
      />
    </Drawer>
  );
};
