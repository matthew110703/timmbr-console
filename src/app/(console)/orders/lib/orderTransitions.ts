import type { ManufacturingEventType, OrderStatus } from "../types";

export const ALLOWED_ORDER_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
} as const;

export const MANUFACTURING_EVENT_TYPES: ManufacturingEventType[] = [
  "MATERIAL_PREPARATION",
  "MANUFACTURING_STARTED",
  "MANUFACTURING_UPDATE",
  "QUALITY_CHECK_COMPLETED",
  "READY_FOR_DISPATCH",
  "DELIVERY_COORDINATION",
];

export function getAllowedNextStatuses(
  current: OrderStatus,
  options?: { excludeCancelled?: boolean },
): OrderStatus[] {
  const next = [...(ALLOWED_ORDER_TRANSITIONS[current] ?? [])];
  if (options?.excludeCancelled) {
    return next.filter((s) => s !== "CANCELLED");
  }
  return next;
}

export function getManufacturingEventsForStatus(
  status: OrderStatus,
): ManufacturingEventType[] {
  if (status === "PROCESSING") {
    return MANUFACTURING_EVENT_TYPES;
  }
  if (status === "SHIPPED") {
    return ["DELIVERY_COORDINATION"];
  }
  return [];
}

export type OrderListSortPreset =
  "newest" | "oldest" | "highestTotal" | "lowestTotal";

export const SORT_PRESET_PARAMS: Record<
  OrderListSortPreset,
  { sortBy: "createdAt" | "placedAt" | "grandTotal"; order: "asc" | "desc" }
> = {
  newest: { sortBy: "createdAt", order: "desc" },
  oldest: { sortBy: "createdAt", order: "asc" },
  highestTotal: { sortBy: "grandTotal", order: "desc" },
  lowestTotal: { sortBy: "grandTotal", order: "asc" },
};
