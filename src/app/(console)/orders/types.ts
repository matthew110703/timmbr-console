export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentProvider = "RAZORPAY";

export type AdminOrderSortField = "createdAt" | "placedAt" | "grandTotal";
export type OrderSortDirection = "asc" | "desc";

export type ManufacturingEventType =
  | "MATERIAL_PREPARATION"
  | "MANUFACTURING_STARTED"
  | "MANUFACTURING_UPDATE"
  | "QUALITY_CHECK_COMPLETED"
  | "READY_FOR_DISPATCH"
  | "DELIVERY_COORDINATION";

export interface AdminOrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentProvider | null;
  thumbnail: string | null;
  acknowledgedAt: string | null;
  grandTotal: number;
  currency: string;
  itemsCount: number;
  customer: AdminOrderCustomer;
  placedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus[];
  sortBy?: AdminOrderSortField;
  order?: OrderSortDirection;
}

export interface OrderAddressSnapshot {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type?: string;
  label?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  name: string;
  sku: string;
  quantity: number;
  originalUnitPrice?: number;
  unitPrice: number;
  discountAmount?: number;
  totalPrice: number;
  hsnCode: string | null;
  gstRate: number;
  taxAmount: number;
  metadata?: Record<string, unknown>;
  thumbnail: string | null;
  productSlug: string | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: string;
  pdfStatus: string;
  issuedAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  cartId: string | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  currency: string;
  paymentMethod: PaymentProvider | null;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
  installationRequired: boolean;
  shippingAddressId: string | null;
  shippingAddress: OrderAddressSnapshot | null;
  billingAddressId?: string | null;
  billingAddress?: OrderAddressSnapshot | null;
  placedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments?: PaymentRecord[];
  invoice?: OrderInvoiceSummary | null;
}

export interface OrderActivityStaff {
  id: string;
  name: string;
  role: string;
}

export interface OrderActivity {
  id: string;
  orderId: string;
  staffId: string | null;
  staff: OrderActivityStaff | null;
  eventType: string;
  description: string;
  updateCategory: string | null;
  isCustomerVisible: boolean;
  metadata?: Record<string, unknown> | null;
  notification: {
    id: string;
    channel: string;
    recipient: string;
    status: string;
    attempts: number;
    sentAt: string | null;
    lastError: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface OrderTimeline {
  orderId: string;
  hasManufacturingStarted: boolean;
  pendingCancellationRequest: OrderActivity | null;
  activities: OrderActivity[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  notes?: string;
  verificationCode?: string;
}

export interface CreateOrderActivityInput {
  eventType: ManufacturingEventType;
  description?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}
