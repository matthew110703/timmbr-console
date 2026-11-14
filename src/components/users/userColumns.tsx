"use client";

import React from "react";
import {
  Avatar,
  Badge,
  Inline,
  Stack,
  Text,
  type ColumnDef,
  type CellContext,
} from "@timmbr/ui";
import { formatDateTime } from "@/app/(console)/orders/lib/formatMoney";
import { strings } from "@/app/(console)/users/strings";
import type { AdminUserListItem } from "@/app/(console)/users/types";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

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

export function createUserColumns(): ColumnDef<AdminUserListItem>[] {
  return [
    {
      id: "user",
      enableSorting: false,
      header: strings.table.user,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => {
        const user = row.original;
        const initials = getInitials(user.name, user.email);

        return (
          <Inline gap={3} align="center" className="py-1 min-w-[200px]">
            <Avatar initials={initials} size="sm" />
            <Stack gap={0.5} className="min-w-0">
              <Text variant="body-2" className="font-semibold truncate">
                {user.name || strings.placeholders.notProvided}
              </Text>
              <Text variant="body-3" foreground="muted" className="truncate">
                {user.email}
              </Text>
            </Stack>
          </Inline>
        );
      },
    },
    {
      accessorKey: "phone",
      enableSorting: false,
      header: strings.table.contact,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => (
        <Text variant="body-3" className="font-mono text-muted-foreground">
          {row.original.phone ?? strings.placeholders.notProvided}
        </Text>
      ),
    },
    {
      id: "role",
      enableSorting: false,
      header: strings.table.role,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => {
        const isPendingInvite =
          row.original.role !== "USER" && row.original.hasPassword === false;

        return (
          <Inline gap={1.5} align="center">
            <UserRoleBadge role={row.original.role} />
            {isPendingInvite && (
              <Badge variant="warning" size="sm">
                {strings.badges.pendingInvite}
              </Badge>
            )}
          </Inline>
        );
      },
    },
    {
      id: "status",
      enableSorting: false,
      header: strings.table.status,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => (
        <UserStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "emailVerified",
      enableSorting: false,
      header: strings.table.verified,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => {
        const verified = row.original.emailVerified;
        return (
          <Badge
            variant={verified ? "success" : "subtle"}
            size="sm"
            className="text-xs"
          >
            {verified
              ? strings.verification.verified
              : strings.verification.unverified}
          </Badge>
        );
      },
    },
    {
      id: "providers",
      enableSorting: false,
      header: strings.table.providers,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => {
        const { linkedProviders } = row.original;
        if (!linkedProviders || linkedProviders.length === 0) {
          return (
            <Badge variant="outline" size="sm">
              {strings.providers.PASSWORD}
            </Badge>
          );
        }
        return (
          <Inline gap={1} wrap>
            {linkedProviders.map((provider) => (
              <Badge key={provider} variant="outline" size="sm">
                {strings.providers[provider] ?? provider}
              </Badge>
            ))}
          </Inline>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      enableSorting: false,
      header: strings.table.lastLogin,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => (
        <Text variant="body-3" foreground="muted">
          {row.original.lastLoginAt
            ? formatDateTime(row.original.lastLoginAt)
            : strings.placeholders.never}
        </Text>
      ),
    },
    {
      accessorKey: "createdAt",
      enableSorting: false,
      header: strings.table.createdAt,
      cell: ({ row }: CellContext<AdminUserListItem, unknown>) => (
        <Text variant="body-3" foreground="muted">
          {formatDateTime(row.original.createdAt)}
        </Text>
      ),
    },
  ];
}
