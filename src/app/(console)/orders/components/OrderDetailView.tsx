"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Alert,
  Badge,
  Button,
  Center,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Inline,
  Stack,
  Text,
  toast,
} from "@timmbr/ui";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components";
import { orderApi } from "../api";
import { formatAddressBlock } from "../lib/formatOrderAddress";
import { formatDateTime, formatMoney } from "../lib/formatMoney";
import {
  getAllowedNextStatuses,
  getManufacturingEventsForStatus,
} from "../lib/orderTransitions";
import { strings } from "../strings";
import type {
  LogOrderActivityFormValues,
  UpdateOrderStatusFormValues,
} from "../validationSchema";
import type { OrderDetail, OrderTimeline } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { UpdateStatusDialog } from "./UpdateStatusDialog";
import { LogActivityDialog } from "./LogActivityDialog";

export interface OrderDetailViewProps {
  initialOrder: OrderDetail;
  initialTimeline: OrderTimeline;
}

function eventTypeLabel(eventType: string): string {
  const key = eventType as keyof typeof strings.events;
  return strings.events[key] ?? eventType.replaceAll("_", " ");
}

function MetaField({
  label,
  value,
  mono,
  emphasize,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  emphasize?: boolean;
}) {
  return (
    <Stack gap={0.5} className="min-w-0">
      <Text variant="body-3" foreground="muted">
        {label}
      </Text>
      <Text
        variant="body-2"
        className={[
          "truncate",
          mono ? "font-mono text-sm" : "",
          emphasize ? "font-semibold tabular-nums" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </Text>
    </Stack>
  );
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  initialOrder,
  initialTimeline,
}) => {
  const [order, setOrder] = useState<OrderDetail>(initialOrder);
  const [timeline, setTimeline] = useState<OrderTimeline>(initialTimeline);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const latestPayment = order.payments?.[0];
  const paymentStatus = latestPayment?.status ?? null;

  const allowedStatuses = useMemo(
    () => getAllowedNextStatuses(order.status, { excludeCancelled: true }),
    [order.status],
  );

  const allowedManufacturing = useMemo(
    () => getManufacturingEventsForStatus(order.status),
    [order.status],
  );

  const showAcknowledge = order.status === "CONFIRMED" && !order.acknowledgedAt;

  const refreshOrderData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [nextOrder, nextTimeline] = await Promise.all([
        orderApi.getOrderById(order.id),
        orderApi.getOrderActivities(order.id),
      ]);
      setOrder(nextOrder);
      setTimeline(nextTimeline);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : strings.toasts.refreshError,
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [order.id]);

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    try {
      const updated = await orderApi.acknowledgeOrder(order.id);
      setOrder(updated);
      await refreshOrderData();
      toast.success(strings.toasts.acknowledgeSuccess);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleUpdateStatus = async (values: UpdateOrderStatusFormValues) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await orderApi.updateOrderStatus(order.id, values);
      setOrder(updated);
      setStatusOpen(false);
      await refreshOrderData();
      toast.success(strings.toasts.statusSuccess);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogActivity = async (values: LogOrderActivityFormValues) => {
    setIsLoggingActivity(true);
    try {
      await orderApi.recordOrderActivity(order.id, values);
      setActivityOpen(false);
      await refreshOrderData();
      toast.success(strings.toasts.activitySuccess);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setIsLoggingActivity(false);
    }
  };

  const timelinePanel = (
    <Card className="w-full h-full min-h-0 flex flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b border-border">
        <Inline justify="between" align="center" gap={2}>
          <CardTitle>{strings.detail.timelineTitle}</CardTitle>
          <Badge variant="subtle" size="sm">
            {strings.detail.activityCount(timeline.activities.length)}
          </Badge>
        </Inline>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col overflow-y-auto p-4">
        {timeline.pendingCancellationRequest ? (
          <Alert
            variant="warning"
            title={strings.detail.pendingCancellation}
            className="mb-4"
          />
        ) : null}

        {timeline.hasManufacturingStarted ? (
          <Text variant="body-3" foreground="muted" className="mb-3 block">
            {strings.detail.manufacturingStarted}
          </Text>
        ) : null}

        {timeline.activities.length === 0 ? (
          <Center className="flex-1 min-h-[12rem] w-full px-4">
            <Text
              variant="body-2"
              foreground="muted"
              className="text-center max-w-sm"
            >
              {strings.detail.timelineEmpty}
            </Text>
          </Center>
        ) : (
          <ol className="relative space-y-0 border-l border-border ml-2">
            {timeline.activities.map((activity) => (
              <li key={activity.id} className="relative pl-5 pb-5 last:pb-0">
                <span className="absolute left-[-5px] top-1.5 size-2.5 rounded-full bg-border ring-4 ring-card" />
                <Stack gap={1}>
                  <Inline justify="between" align="start" wrap gap={2}>
                    <Text variant="body-2" className="font-semibold">
                      {eventTypeLabel(activity.eventType)}
                    </Text>
                    <Badge
                      variant={activity.isCustomerVisible ? "brand" : "outline"}
                      size="sm"
                    >
                      {activity.isCustomerVisible
                        ? strings.detail.visibilityCustomer
                        : strings.detail.visibilityInternal}
                    </Badge>
                  </Inline>
                  <Text variant="body-3" foreground="muted">
                    {activity.description}
                  </Text>
                  <Text variant="body-3" foreground="subtle">
                    {formatDateTime(activity.createdAt)} ·{" "}
                    {activity.staff?.name ?? strings.detail.staffUnknown}
                  </Text>
                </Stack>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <div className="shrink-0 space-y-3">
        <PageHeader
          breadcrumbs={
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              {strings.detail.backToOrders}
            </Link>
          }
          title={order.orderNumber}
          badge={<OrderStatusBadge status={order.status} />}
          action={
            <Inline gap={2} wrap align="center">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="size-4" />}
                loading={isRefreshing}
                onClick={() => void refreshOrderData()}
              >
                {strings.detail.refresh}
              </Button>
              {showAcknowledge ? (
                <Button
                  size="sm"
                  loading={isAcknowledging}
                  onClick={() => void handleAcknowledge()}
                >
                  {strings.detail.acknowledge}
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusOpen(true)}
                disabled={allowedStatuses.length === 0}
              >
                {strings.detail.updateStatus}
              </Button>
              <Button
                variant="default"
                size="sm"
                leftIcon={<ClipboardList className="size-4" />}
                onClick={() => setActivityOpen(true)}
                disabled={allowedManufacturing.length === 0}
              >
                {strings.detail.logActivity}
              </Button>
            </Inline>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4 min-h-0 flex-1 overflow-hidden w-full">
        <div className="flex flex-col min-h-0 overflow-y-auto pr-1 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <Inline justify="between" align="center" wrap gap={3}>
                <CardTitle>{strings.detail.overviewTitle}</CardTitle>
                <Text
                  variant="body-1"
                  className="font-semibold tabular-nums text-foreground"
                >
                  {formatMoney(order.grandTotal, order.currency)}
                </Text>
              </Inline>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <MetaField
                  label={strings.detail.customerId}
                  value={order.userId}
                  mono
                />
                <MetaField
                  label={strings.detail.paymentMethod}
                  value={
                    order.paymentMethod
                      ? strings.paymentProvider[order.paymentMethod]
                      : "—"
                  }
                />
                <MetaField
                  label={strings.detail.paymentStatus}
                  value={
                    paymentStatus
                      ? (strings.paymentStatus[paymentStatus] ?? paymentStatus)
                      : strings.paymentStatus.none
                  }
                />
                <MetaField
                  label={strings.detail.subtotal}
                  value={formatMoney(order.subtotal, order.currency)}
                />
                <MetaField
                  label={strings.detail.discount}
                  value={formatMoney(order.discount, order.currency)}
                />
                <MetaField
                  label={strings.detail.shipping}
                  value={formatMoney(order.shippingFee, order.currency)}
                />
                <MetaField
                  label={strings.detail.tax}
                  value={formatMoney(order.tax, order.currency)}
                />
                <MetaField
                  label={strings.detail.placedAt}
                  value={formatDateTime(order.placedAt)}
                />
                <MetaField
                  label={strings.detail.createdAt}
                  value={formatDateTime(order.createdAt)}
                />
                <MetaField
                  label={strings.detail.installation}
                  value={
                    order.installationRequired
                      ? strings.detail.yes
                      : strings.detail.no
                  }
                />
                {order.invoice ? (
                  <MetaField
                    label={strings.detail.invoice}
                    value={`${order.invoice.invoiceNumber} (${order.invoice.status})`}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Inline justify="between" align="center">
                <CardTitle>{strings.detail.itemsTitle}</CardTitle>
                <Text variant="body-3" foreground="muted">
                  {strings.detail.itemsCount(order.items.length)}
                </Text>
              </Inline>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden sm:grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_72px_110px_110px] gap-3 px-4 py-2.5 border-y border-border bg-muted/30">
                <Text variant="body-3" foreground="muted">
                  {strings.detail.item}
                </Text>
                <Text variant="body-3" foreground="muted">
                  {strings.detail.sku}
                </Text>
                <Text
                  variant="body-3"
                  foreground="muted"
                  className="text-right"
                >
                  {strings.detail.qty}
                </Text>
                <Text
                  variant="body-3"
                  foreground="muted"
                  className="text-right"
                >
                  {strings.detail.unitPrice}
                </Text>
                <Text
                  variant="body-3"
                  foreground="muted"
                  className="text-right"
                >
                  {strings.detail.lineTotal}
                </Text>
              </div>
              <Stack gap={0}>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_72px_110px_110px] gap-2 sm:gap-3 items-center px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <Inline gap={3} align="center" className="min-w-0">
                      <div className="relative size-10 rounded-md border border-border bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <Text
                        variant="body-2"
                        className="font-medium min-w-0 truncate"
                      >
                        {item.name}
                      </Text>
                    </Inline>
                    <Text
                      variant="body-3"
                      foreground="muted"
                      className="font-mono truncate"
                    >
                      {item.sku}
                    </Text>
                    <Text
                      variant="body-2"
                      className="tabular-nums sm:text-right"
                    >
                      {item.quantity}
                    </Text>
                    <Text
                      variant="body-2"
                      className="tabular-nums sm:text-right"
                    >
                      {formatMoney(item.unitPrice, order.currency)}
                    </Text>
                    <Text
                      variant="body-2"
                      className="font-medium tabular-nums sm:text-right"
                    >
                      {formatMoney(item.totalPrice, order.currency)}
                    </Text>
                  </div>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="size-4" />
                  {strings.detail.shippingTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text variant="body-2" className="whitespace-pre-line">
                  {formatAddressBlock(order.shippingAddress)}
                </Text>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {strings.detail.billingTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text variant="body-2" className="whitespace-pre-line">
                  {formatAddressBlock(
                    order.billingAddress ?? order.shippingAddress,
                  )}
                </Text>
              </CardContent>
            </Card>
          </div>

          <div className="xl:hidden min-h-[320px] w-full">{timelinePanel}</div>
        </div>

        <aside className="hidden xl:flex flex-col min-h-0 min-w-0 w-full overflow-hidden">
          {timelinePanel}
        </aside>
      </div>

      <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        allowedStatuses={allowedStatuses}
        isSubmitting={isUpdatingStatus}
        onSubmit={handleUpdateStatus}
      />

      <LogActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        allowedEventTypes={allowedManufacturing}
        isSubmitting={isLoggingActivity}
        onSubmit={handleLogActivity}
      />
    </div>
  );
};
