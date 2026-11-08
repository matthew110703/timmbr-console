import { api, API_ROUTES } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { GetTransactionsParams, TransactionListItem } from "./types";

function normalizePaginated(
  res: PaginatedResult<TransactionListItem> | TransactionListItem[],
): PaginatedResult<TransactionListItem> {
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

export const transactionApi = {
  getTransactions: async (
    params?: GetTransactionsParams,
  ): Promise<PaginatedResult<TransactionListItem>> => {
    const res = await api.get<
      PaginatedResult<TransactionListItem> | TransactionListItem[]
    >(API_ROUTES.ADMIN.TRANSACTIONS, {
      params: {
        page: params?.page,
        limit: params?.limit ?? 20,
        search: params?.search,
        status: params?.status?.length ? params.status.join(",") : undefined,
      },
      next: { revalidate: 60, tags: ["transactions"] },
    });
    return normalizePaginated(res);
  },
};
