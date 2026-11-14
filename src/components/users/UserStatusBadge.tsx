import React from "react";
import { Badge, type BadgeProps } from "@timmbr/ui";
import { strings } from "@/app/(console)/users/strings";
import type { UserStatus } from "@/app/(console)/users/types";

interface UserStatusBadgeProps {
  status: UserStatus;
  size?: BadgeProps["size"];
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const isDeleted = status === "DELETED";
  const variant: BadgeProps["variant"] = isDeleted ? "destructive" : "success";
  const label = strings.statusBadge[status] ?? status;

  return (
    <Badge variant={variant} size={size} dot>
      {label}
    </Badge>
  );
};
