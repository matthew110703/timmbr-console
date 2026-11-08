import React from "react";
import { notFound } from "next/navigation";
import { Alert } from "@timmbr/ui";
import { orderApi } from "../api";
import { OrderDetailView } from "../components/OrderDetailView";
import { strings } from "../strings";
import type { OrderTimeline } from "../types";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

const emptyTimeline = (orderId: string): OrderTimeline => ({
  orderId,
  hasManufacturingStarted: false,
  pendingCancellationRequest: null,
  activities: [],
});

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  try {
    const order = await orderApi.getOrderById(orderId);
    return { title: strings.metadata.detailTitle(order.orderNumber) };
  } catch {
    return { title: strings.metadata.title };
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;

  let error: string | null = null;
  let order: Awaited<ReturnType<typeof orderApi.getOrderById>> | null = null;
  let timeline: OrderTimeline | null = null;

  try {
    [order, timeline] = await Promise.all([
      orderApi.getOrderById(orderId),
      orderApi.getOrderActivities(orderId).catch(() => emptyTimeline(orderId)),
    ]);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : strings.error.title;
  }

  if (order && timeline) {
    return <OrderDetailView initialOrder={order} initialTimeline={timeline} />;
  }

  if (
    error &&
    (error.includes("404") ||
      error.toLowerCase().includes("not found") ||
      error.toLowerCase().includes("order not found"))
  ) {
    notFound();
  }

  if (error) {
    return (
      <Alert variant="destructive" title={strings.error.title}>
        {error}
      </Alert>
    );
  }

  notFound();
}
