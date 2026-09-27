"use client";

import * as React from "react";
import {
  Dialog,
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
  const initials = React.useMemo(() => {
    if (!profile?.name) return undefined;
    const words = profile.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return undefined;
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }, [profile]);

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
        label: strings.profile.dialog.fields.email,
        value: (
          <Text variant="body-2" weight="medium" className="truncate">
            {profile?.email || "—"}
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{strings.profile.dialog.title}</DialogTitle>
          <DialogDescription>
            {strings.profile.dialog.description}
          </DialogDescription>
        </DialogHeader>

        <Stack gap={4} className="py-2">
          {/* User Identity Header Card */}
          <Card variant="subtle" padding="md">
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
                  <Inline gap={2} align="center">
                    <Text
                      variant="body-1"
                      weight="semibold"
                      className="truncate"
                    >
                      {profile?.name || "—"}
                    </Text>
                    {profile?.role && (
                      <Badge
                        variant="brand"
                        size="sm"
                        className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs"
                      >
                        {profile.role}
                      </Badge>
                    )}
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
                  variant={profile.emailVerified ? "primary" : "outline"}
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

          {/* Key-Value Details via DataList */}
          <Card variant="outline" padding="sm">
            <DataList divided size="sm">
              {fields.map(({ label, value }) => (
                <DataListItem key={label} align="center">
                  <DataListLabel minWidth={110}>
                    <Text variant="caption" foreground="muted" weight="medium">
                      {label}
                    </Text>
                  </DataListLabel>
                  <DataListValue>{value}</DataListValue>
                </DataListItem>
              ))}
            </DataList>
          </Card>
        </Stack>

        <DialogFooter>
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
