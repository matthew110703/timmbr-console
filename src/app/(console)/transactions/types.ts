import type { OrderStatus } from "@/app/(console)/orders/types";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentProvider = "RAZORPAY";

export interface TransactionCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface TransactionListItem {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  provider: PaymentProvider;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customer: TransactionCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus[];
}
