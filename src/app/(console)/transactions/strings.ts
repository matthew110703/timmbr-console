export const strings = {
  metadata: {
    title: "Transactions — Timmbr Console",
    description: "View payment transactions across customer orders.",
  },
  header: {
    title: "Transactions",
    subtitle: "Payment attempts and outcomes linked to storefront orders.",
  },
  toolbar: {
    searchPlaceholder:
      "Search by order number, payment ID, provider ID, or customer...",
    clearFilters: "Clear filters",
    statusFilterAll: "All payment statuses",
  },
  table: {
    orderNumber: "Order",
    customer: "Customer",
    paymentStatus: "Payment",
    orderStatus: "Order status",
    provider: "Provider",
    amount: "Amount",
    providerPaymentId: "Provider payment ID",
    createdAt: "Created",
    empty:
      "No transactions yet. Payments will appear here when customers checkout.",
    emptyFiltered: "No transactions matched your filters.",
    emptyTitle: "No Transactions",
  },
  paymentStatus: {
    PENDING: "Pending",
    PROCESSING: "Processing",
    PAID: "Paid",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED: "Partial refund",
  },
  paymentProvider: {
    RAZORPAY: "Razorpay",
  },
  toasts: {
    error: "Something went wrong. Please try again.",
  },
};
