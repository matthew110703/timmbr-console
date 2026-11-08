import React from "react";
import { Badge } from "@timmbr/ui";
import { strings } from "../strings";
import type { OrderStatus } from "../types";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
}) => {
  const label = strings.orderStatus[status] ?? status;

  switch (status) {
    case "DELIVERED":
      return (
        <Badge variant="success" size="sm" dot className={className}>
          {label}
        </Badge>
      );
    case "CONFIRMED":
    case "PROCESSING":
      return (
        <Badge variant="brand" size="sm" dot className={className}>
          {label}
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge variant="primary" size="sm" dot className={className}>
          {label}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="subtle" size="sm" dot className={className}>
          {label}
        </Badge>
      );
    case "CANCELLED":
    case "RETURNED":
      return (
        <Badge variant="destructive" size="sm" dot className={className}>
          {label}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size="sm" className={className}>
          {label}
        </Badge>
      );
  }
};
