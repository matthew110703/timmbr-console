import React from "react";
import { Badge } from "@timmbr/ui";
import { strings } from "../strings";
import type { PaymentStatus } from "../types";

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

function badgeVariant(
  status: PaymentStatus,
): "success" | "destructive" | "subtle" | "outline" {
  switch (status) {
    case "PAID":
      return "success";
    case "FAILED":
    case "CANCELLED":
      return "destructive";
    case "PENDING":
    case "PROCESSING":
      return "subtle";
    default:
      return "outline";
  }
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const label = strings.paymentStatus[status] ?? status;
  return (
    <Badge variant={badgeVariant(status)} size="sm" className={className}>
      {label}
    </Badge>
  );
};
