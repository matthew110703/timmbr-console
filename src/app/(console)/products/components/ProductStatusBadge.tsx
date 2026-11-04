import React from "react";
import { Badge } from "@timmbr/ui";
import { strings } from "../strings";
import type { ProductStatus } from "../types";

export interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" size="sm" dot className={className}>
          {strings.status.active}
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge variant="warning" size="sm" dot className={className}>
          {strings.status.draft}
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="default" size="sm" dot className={className}>
          {strings.status.archived}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm" className={className}>
          {status}
        </Badge>
      );
  }
};
