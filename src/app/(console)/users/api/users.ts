import { api, API_ROUTES, userAdminRoutes } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AdminCreateUserResponse,
  AdminUserListItem,
  CreateAdminUserPayload,
  GetAdminUsersParams,
  UpdateAdminUserPayload,
} from "../types";

function normalizePaginated(
  res: PaginatedResult<AdminUserListItem> | AdminUserListItem[],
): PaginatedResult<AdminUserListItem> {
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

export const usersApi = {
  getUsers: async (
    params?: GetAdminUsersParams,
  ): Promise<PaginatedResult<AdminUserListItem>> => {
    const res = await api.get<
      PaginatedResult<AdminUserListItem> | AdminUserListItem[]
    >(API_ROUTES.ADMIN.USERS, {
      params: {
        page: params?.page,
        limit: params?.limit ?? 20,
        role: params?.role,
        status: params?.status,
        search: params?.search,
      },
      next: { revalidate: 60, tags: ["admin-users"] },
    });
    return normalizePaginated(res);
  },

  getUser: async (userId: string): Promise<AdminUserListItem> => {
    return api.get<AdminUserListItem>(`${API_ROUTES.ADMIN.USERS}/${userId}`, {
      cache: "no-store",
    });
  },

  createUser: async (
    payload: CreateAdminUserPayload,
  ): Promise<AdminCreateUserResponse> => {
    return api.post<AdminCreateUserResponse>(API_ROUTES.ADMIN.USERS, payload);
  },

  updateUser: async (
    userId: string,
    payload: UpdateAdminUserPayload,
  ): Promise<AdminUserListItem> => {
    return api.patch<AdminUserListItem>(
      `${API_ROUTES.ADMIN.USERS}/${userId}`,
      payload,
    );
  },

  resendInvite: async (userId: string): Promise<void> => {
    return api.post<void>(userAdminRoutes.resendInvite(userId));
  },
};
