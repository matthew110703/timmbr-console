"use client";

import React, { useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Inline,
  Stack,
  Text,
  Tooltip,
} from "@timmbr/ui";
import { strings } from "@/app/(console)/users/strings";
import {
  PERMISSION_GROUPS,
  STAFF_ASSIGNABLE_PERMISSIONS,
  type PermissionGroup,
  type UserRole,
} from "@/app/(console)/users/types";
import {
  CONSOLE_PERMISSIONS,
  getMissingDependencies,
  cascadeDeselectPermission,
  type Permission,
} from "@/lib/auth/permissions";

const PERMISSION_LABELS: Record<string, string> = {
  [CONSOLE_PERMISSIONS.USERS_READ]: "Users Read",
  [CONSOLE_PERMISSIONS.USERS_CREATE]: "Users Create",
  [CONSOLE_PERMISSIONS.USERS_UPDATE]: "Users Update",
  [CONSOLE_PERMISSIONS.ADMINS_CREATE]: "Admins Create",
  [CONSOLE_PERMISSIONS.ADMINS_UPDATE]: "Admins Update",
  [CONSOLE_PERMISSIONS.ORDERS_READ]: "Orders Read",
  [CONSOLE_PERMISSIONS.ORDERS_UPDATE]: "Update Orders",
  [CONSOLE_PERMISSIONS.ORDERS_CANCEL]: "Cancel Orders",
  [CONSOLE_PERMISSIONS.ORDERS_MESSAGE]: "Message Customers",
  [CONSOLE_PERMISSIONS.ORDERS_DELIVER]: "Mark Delivered",
  [CONSOLE_PERMISSIONS.CATALOG_READ]: "Catalog Read",
  [CONSOLE_PERMISSIONS.CATALOG_WRITE]: "Create & Edit Catalog",
  [CONSOLE_PERMISSIONS.CATALOG_DELETE]: "Delete Catalog Items",
  [CONSOLE_PERMISSIONS.TRANSACTIONS_READ]: "Transactions Read",
  [CONSOLE_PERMISSIONS.TRANSACTIONS_REFUND]: "Process Refunds",
};

export interface PermissionMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  targetRole?: UserRole;
  isCallerMaster?: boolean;
  disabled?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedPermissions,
  onChange,
  targetRole = "STAFF",
  isCallerMaster = false,
  disabled = false,
}) => {
  const isMasterTarget = targetRole === "MASTER";
  const isStaffTarget = targetRole === "STAFF";

  // Filter permission groups based on the target role
  const visibleGroups = useMemo<PermissionGroup[]>(() => {
    if (isStaffTarget) {
      // Staff accounts are restricted to operational domains
      return PERMISSION_GROUPS.filter(
        (group) => group.id !== "users" && group.id !== "admins",
      ).map((group) => ({
        ...group,
        permissions: group.permissions.filter((p) =>
          STAFF_ASSIGNABLE_PERMISSIONS.includes(p.id as Permission),
        ),
      }));
    }

    if (!isCallerMaster) {
      // Non-master callers cannot assign admins management permissions
      return PERMISSION_GROUPS.filter((group) => !group.masterOnly);
    }

    return PERMISSION_GROUPS;
  }, [isStaffTarget, isCallerMaster]);

  const togglePermission = (permId: Permission, checked: boolean) => {
    if (disabled || isMasterTarget) return;
    if (checked) {
      if (!selectedPermissions.includes(permId)) {
        onChange([...selectedPermissions, permId]);
      }
    } else {
      onChange(cascadeDeselectPermission(permId, selectedPermissions));
    }
  };

  const toggleGroup = (group: PermissionGroup) => {
    if (disabled || isMasterTarget) return;
    const groupPermIds = group.permissions.map((p) => p.id as Permission);
    const allSelected =
      groupPermIds.length > 0 &&
      groupPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all in group with cascading deselect across dependents
      let next = [...selectedPermissions];
      for (const permId of groupPermIds) {
        next = cascadeDeselectPermission(permId, next);
      }
      onChange(next);
    } else {
      // Select all in group
      const newPerms = new Set([...selectedPermissions, ...groupPermIds]);
      onChange(Array.from(newPerms));
    }
  };

  if (isMasterTarget) {
    return (
      <Card
        variant="subtle"
        className="p-4 border border-warning/30 bg-warning/5 rounded-lg"
      >
        <Stack gap={1.5}>
          <Inline gap={2} align="center">
            <Badge variant="warning" size="sm" dot>
              {strings.roleBadge.MASTER}
            </Badge>
            <Text variant="body-2" className="font-semibold text-foreground">
              {strings.detailsDrawer.masterNotice}
            </Text>
          </Inline>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap={4}>
      {isStaffTarget && (
        <Card
          variant="subtle"
          className="p-4 border border-border/60 bg-muted/30 rounded-lg"
        >
          <Text variant="caption" foreground="muted">
            {strings.permissionMatrix.staffNotice}
          </Text>
        </Card>
      )}

      {visibleGroups.map((group) => {
        const groupPermIds = group.permissions.map((p) => p.id as Permission);
        const allSelected =
          groupPermIds.length > 0 &&
          groupPermIds.every((id) => selectedPermissions.includes(id));

        const isAdminsGroup = group.id === "admins";
        const hasUsersRead = selectedPermissions.includes(
          CONSOLE_PERMISSIONS.USERS_READ,
        );
        const isGroupSelectAllDisabled = isAdminsGroup && !hasUsersRead;

        return (
          <Card
            key={group.id}
            variant="outline"
            className="p-5 border border-border bg-card rounded-xl shadow-xs"
          >
            <Stack gap={4}>
              <Inline justify="between" align="center" wrap gap={2}>
                <Stack gap={0.5}>
                  <Inline gap={2} align="center">
                    <Text
                      variant="body-2"
                      className="font-semibold text-foreground"
                    >
                      {group.label}
                    </Text>
                    {group.masterOnly && (
                      <Badge variant="warning" size="sm">
                        {strings.permissionMatrix.masterOnlyBadge}
                      </Badge>
                    )}
                  </Inline>
                  <Text variant="caption" foreground="muted">
                    {group.description}
                  </Text>
                </Stack>

                {!disabled &&
                  (!allSelected && isGroupSelectAllDisabled ? (
                    <Tooltip content={strings.tooltips.adminsNeedUsersRead}>
                      <span className="inline-flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-xs h-7 px-2.5"
                        >
                          {strings.permissionMatrix.selectAll}
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group)}
                      className="text-xs h-7 px-2.5"
                    >
                      {allSelected
                        ? strings.permissionMatrix.deselectAll
                        : strings.permissionMatrix.selectAll}
                    </Button>
                  ))}
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3.5 border-t border-border/50">
                {group.permissions.map((perm) => {
                  const permId = perm.id as Permission;
                  const isChecked = selectedPermissions.includes(permId);
                  const missingDeps = getMissingDependencies(
                    permId,
                    selectedPermissions,
                  );
                  const isPermDisabled = disabled || missingDeps.length > 0;
                  const missingDepsText =
                    missingDeps.length > 0
                      ? `${strings.permissionMatrix.requiresPrefix}${missingDeps
                          .map((dep) => PERMISSION_LABELS[dep] || dep)
                          .join(", ")}`
                      : null;

                  return (
                    <div
                      key={perm.id}
                      className="p-3.5 rounded-lg border border-border/50 hover:border-border transition-colors bg-muted/15 flex flex-col justify-center"
                    >
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          togglePermission(permId, Boolean(checked))
                        }
                        disabled={isPermDisabled}
                        label={perm.label}
                        description={perm.description}
                      />
                      {missingDepsText && (
                        <div className="pl-6 pt-1">
                          <Text
                            variant="caption"
                            foreground="muted"
                            className="text-xs italic"
                          >
                            {missingDepsText}
                          </Text>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};
