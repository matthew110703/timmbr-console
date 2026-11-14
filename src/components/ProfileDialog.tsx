"use client";

import * as React from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  Avatar,
  Card,
  Stack,
  Inline,
  Text,
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
} from "@timmbr/ui";
import type { UserProfile } from "@/types/auth";
import { strings } from "@/app/(console)/strings";
import { PERMISSION_GROUPS } from "@/app/(console)/users/types";
import { UserRoleBadge } from "./users/UserRoleBadge";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: UserProfile | null;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "—"
      : new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
  } catch {
    return "—";
  }
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
}: ProfileDialogProps) {
  React.useEffect(() => {
    if (!open && typeof document !== "undefined") {
      const clearPointerEvents = () => {
        if (document.body.style.pointerEvents === "none") {
          document.body.style.removeProperty("pointer-events");
        }
      };
      clearPointerEvents();
      const timerId = window.setTimeout(clearPointerEvents, 250);
      return () => window.clearTimeout(timerId);
    }
  }, [open]);

  const initials = React.useMemo(() => {
    if (!profile?.name) return undefined;
    const words = profile.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return undefined;
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }, [profile]);

  const isMaster = profile?.role === "MASTER";

  const grantedPermissions = React.useMemo(
    () => profile?.permissions ?? [],
    [profile?.permissions],
  );

  const grantedGroups = React.useMemo(() => {
    if (isMaster) return [];
    return PERMISSION_GROUPS.map((group) => ({
      ...group,
      granted: group.permissions.filter((perm) =>
        grantedPermissions.includes(perm.id),
      ),
    })).filter((group) => group.granted.length > 0);
  }, [isMaster, grantedPermissions]);

  const fields = React.useMemo(
    () => [
      {
        label: strings.profile.dialog.fields.id,
        value: (
          <Text
            variant="caption"
            foreground="muted"
            className="font-mono select-all break-all"
          >
            {profile?.id || "—"}
          </Text>
        ),
      },
      {
        label: strings.profile.dialog.fields.phone,
        value: (
          <Text variant="body-2" weight="medium" className="truncate">
            {profile?.phone || "—"}
          </Text>
        ),
      },
      {
        label: strings.profile.dialog.fields.lastLogin,
        value: (
          <Text variant="body-2" weight="medium">
            {formatDate(profile?.lastLoginAt)}
          </Text>
        ),
      },
      {
        label: strings.profile.dialog.fields.createdAt,
        value: (
          <Text variant="body-2" weight="medium">
            {formatDate(profile?.createdAt)}
          </Text>
        ),
      },
      {
        label: strings.profile.dialog.fields.updatedAt,
        value: (
          <Text variant="body-2" weight="medium">
            {formatDate(profile?.updatedAt)}
          </Text>
        ),
      },
    ],
    [profile],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (
            typeof document !== "undefined" &&
            document.body.style.pointerEvents === "none"
          ) {
            document.body.style.removeProperty("pointer-events");
          }
        }}
      >
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border/40">
          <DialogTitle>{strings.profile.dialog.title}</DialogTitle>
          <DialogDescription>
            {strings.profile.dialog.description}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {/* Identity Header Card */}
          <Card
            variant="subtle"
            padding="none"
            className="p-4 border border-border/50 bg-muted/20 rounded-xl"
          >
            <Inline gap={4} align="center" justify="between" wrap={false}>
              <Inline
                gap={3}
                align="center"
                wrap={false}
                className="min-w-0 flex-1"
              >
                <Avatar
                  size="lg"
                  initials={initials}
                  alt={profile?.name || "User Avatar"}
                  className="ring-2 ring-primary/20 shrink-0"
                />
                <Stack gap={1} className="min-w-0 flex-1">
                  <Inline gap={2} align="center" wrap>
                    <Text
                      variant="body-1"
                      weight="semibold"
                      className="truncate"
                    >
                      {profile?.name || "—"}
                    </Text>
                    {profile?.role && <UserRoleBadge role={profile.role} />}
                  </Inline>
                  <Text
                    variant="caption"
                    foreground="muted"
                    className="truncate"
                  >
                    {profile?.email || "—"}
                  </Text>
                </Stack>
              </Inline>

              {profile?.emailVerified !== undefined && (
                <Badge
                  variant={profile.emailVerified ? "success" : "subtle"}
                  size="sm"
                  dot
                  className="shrink-0"
                >
                  {profile.emailVerified
                    ? strings.profile.dialog.fields.verified
                    : strings.profile.dialog.fields.unverified}
                </Badge>
              )}
            </Inline>
          </Card>

          {/* Account Details Card */}
          <Card
            variant="outline"
            padding="none"
            className="p-4 border border-border bg-card rounded-xl shadow-xs"
          >
            <Stack gap={3}>
              <Text
                variant="body-2"
                weight="semibold"
                className="text-foreground"
              >
                {strings.profile.dialog.detailsSection}
              </Text>
              <DataList divided size="sm">
                {fields.map(({ label, value }) => (
                  <DataListItem key={label} align="center">
                    <DataListLabel minWidth={115}>
                      <Text
                        variant="caption"
                        foreground="muted"
                        weight="medium"
                      >
                        {label}
                      </Text>
                    </DataListLabel>
                    <DataListValue>{value}</DataListValue>
                  </DataListItem>
                ))}
              </DataList>
            </Stack>
          </Card>

          {/* Assigned Permissions Card */}
          <Card
            variant="outline"
            padding="none"
            className="p-4 border border-border bg-card rounded-xl shadow-xs"
          >
            <Stack gap={3}>
              <Inline justify="between" align="center" wrap gap={2}>
                <Text
                  variant="body-2"
                  weight="semibold"
                  className="text-foreground"
                >
                  {strings.profile.dialog.permissionsSection}
                </Text>
                {isMaster ? (
                  <Badge variant="warning" size="sm" dot>
                    {strings.profile.dialog.masterAccessBadge}
                  </Badge>
                ) : (
                  <Badge variant="subtle" size="sm">
                    {grantedPermissions.length}{" "}
                    {strings.profile.dialog.permissionsGrantedSuffix}
                  </Badge>
                )}
              </Inline>

              {isMaster ? (
                <Text variant="caption" foreground="muted">
                  {strings.profile.dialog.masterAccessDescription}
                </Text>
              ) : grantedGroups.length === 0 ? (
                <Text variant="caption" foreground="muted">
                  {strings.profile.dialog.noPermissionsAssigned}
                </Text>
              ) : (
                <Stack gap={3} className="divide-y divide-border/50">
                  {grantedGroups.map((group, index) => (
                    <Stack
                      key={group.id}
                      gap={1.5}
                      className={index > 0 ? "pt-3" : undefined}
                    >
                      <Text
                        variant="caption"
                        weight="semibold"
                        foreground="muted"
                      >
                        {group.label}
                      </Text>
                      <Inline gap={1.5} wrap>
                        {group.granted.map((perm) => (
                          <Badge key={perm.id} variant="subtle" size="sm">
                            {perm.label}
                          </Badge>
                        ))}
                      </Inline>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </DialogBody>

        <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {strings.profile.dialog.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
