import { api, API_ROUTES, orderAdminRoutes } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AdminOrder,
  CreateOrderActivityInput,
  GetOrdersParams,
  OrderActivity,
  OrderDetail,
  OrderTimeline,
  UpdateOrderStatusInput,
} from "./types";

function normalizePaginated(
  res: PaginatedResult<AdminOrder> | AdminOrder[],
): PaginatedResult<AdminOrder> {
  if (Array.isArray(res)) {
    return {
      data: res,
      meta: {
        page: 1,
        limit: res.length,
        total: res.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
  return res;
}

export const orderApi = {
  getOrders: async (
    params?: GetOrdersParams,
  ): Promise<PaginatedResult<AdminOrder>> => {
    const res = await api.get<PaginatedResult<AdminOrder> | AdminOrder[]>(
      API_ROUTES.ADMIN.ORDERS,
      {
        params: {
          page: params?.page,
          limit: params?.limit ?? 20,
          search: params?.search,
          status: params?.status?.length ? params.status.join(",") : undefined,
          sortBy: params?.sortBy,
          order: params?.order,
        },
        next: { revalidate: 60, tags: ["orders"] },
      },
    );
    return normalizePaginated(res);
  },

  getOrderById: async (orderId: string): Promise<OrderDetail> => {
    return api.get<OrderDetail>(orderAdminRoutes.byId(orderId), {
      next: { revalidate: 30, tags: [`order-${orderId}`] },
    });
  },

  getOrderActivities: async (orderId: string): Promise<OrderTimeline> => {
    return api.get<OrderTimeline>(orderAdminRoutes.activities(orderId), {
      cache: "no-store",
    });
  },

  acknowledgeOrder: async (orderId: string): Promise<OrderDetail> => {
    return api.post<OrderDetail>(orderAdminRoutes.acknowledge(orderId), {});
  },

  updateOrderStatus: async (
    orderId: string,
    body: UpdateOrderStatusInput,
  ): Promise<OrderDetail> => {
    return api.patch<OrderDetail>(orderAdminRoutes.status(orderId), body);
  },

  recordOrderActivity: async (
    orderId: string,
    body: CreateOrderActivityInput,
  ): Promise<OrderActivity> => {
    return api.post<OrderActivity>(orderAdminRoutes.activities(orderId), body);
  },
};
