import React from "react";
import { Badge, type BadgeProps } from "@timmbr/ui";
import { strings } from "@/app/(console)/users/strings";
import type { UserRole } from "@/app/(console)/users/types";

interface UserRoleBadgeProps {
  role: UserRole;
  size?: BadgeProps["size"];
}

const ROLE_VARIANT_MAP: Record<UserRole, BadgeProps["variant"]> = {
  USER: "subtle",
  STAFF: "info",
  ADMIN: "primary",
  MASTER: "warning",
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  size = "sm",
}) => {
  const variant = ROLE_VARIANT_MAP[role] ?? "subtle";
  const label = strings.roleBadge[role] ?? role;

  return (
    <Badge variant={variant} size={size} dot>
      {label}
    </Badge>
  );
};
