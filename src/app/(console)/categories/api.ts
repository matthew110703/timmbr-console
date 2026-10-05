import { api, API_ROUTES } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  Category,
  CategoryWithParent,
  CategoryTreeNode,
  CreateCategoryInput,
  GetCategoriesParams,
  UpdateCategoryInput,
} from "./types";

export const categoryApi = {
  /**
   * Fetches paginated categories from the admin endpoint.
   * Matches CategoryAdminController `GET /api/v1/admin/categories` in timmbr-core.
   */
  getCategories: async (
    params?: GetCategoriesParams,
  ): Promise<PaginatedResult<Category>> => {
    const res = await api.get<PaginatedResult<Category> | Category[]>(
      API_ROUTES.ADMIN.CATEGORIES,
      {
        params: {
          page: params?.page,
          limit: params?.limit ?? 50,
          status: params?.status,
          search: params?.search,
          parentId: params?.parentId,
        },
        next: { revalidate: 60, tags: ["categories"] },
      },
    );

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
  },

  /**
   * Fetches a single category with its parent relation.
   * Matches CategoryAdminController `GET /api/v1/admin/categories/:catId` in timmbr-core.
   */
  getCategoryById: async (catId: string): Promise<CategoryWithParent> => {
    return api.get<CategoryWithParent>(
      `${API_ROUTES.ADMIN.CATEGORIES}/${catId}`,
      {
        next: { revalidate: 30, tags: [`category-${catId}`] },
      },
    );
  },

  /**
   * Fetches category subtree.
   * Matches CategoryAdminController `GET /api/v1/admin/categories/tree/:parentId` in timmbr-core.
   */
  getCategoryTree: async (parentId?: string): Promise<CategoryTreeNode[]> => {
    const path = parentId
      ? `${API_ROUTES.ADMIN.CATEGORIES}/tree/${parentId}`
      : `${API_ROUTES.ADMIN.CATEGORIES}/tree`;
    return api.get<CategoryTreeNode[]>(path, {
      next: { revalidate: 60, tags: ["categories-tree"] },
    });
  },

  /**
   * Creates a new category.
   * Matches CategoryAdminController `POST /api/v1/admin/categories` in timmbr-core.
   */
  createCategory: async (dto: CreateCategoryInput): Promise<Category> => {
    const payload = {
      name: dto.name,
      description: dto.description || undefined,
      parentId: dto.parentId || undefined,
      logoUrl: dto.logoUrl || undefined,
      status: dto.status ?? "ACTIVE",
    };

    return api.post<Category>(API_ROUTES.ADMIN.CATEGORIES, payload);
  },

  /**
   * Updates an existing category.
   * Matches CategoryAdminController `PATCH /api/v1/admin/categories/:catId` in timmbr-core.
   */
  updateCategory: async (
    catId: string,
    dto: UpdateCategoryInput,
  ): Promise<Category> => {
    const payload: Record<string, unknown> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.parentId !== undefined) payload.parentId = dto.parentId;
    if (dto.logoUrl !== undefined) payload.logoUrl = dto.logoUrl;
    if (dto.status !== undefined) payload.status = dto.status;

    return api.patch<Category>(
      `${API_ROUTES.ADMIN.CATEGORIES}/${catId}`,
      payload,
    );
  },

  /**
   * Deletes a category.
   * Matches CategoryAdminController `DELETE /api/v1/admin/categories/:catId` in timmbr-core.
   */
  deleteCategory: async (catId: string, force = false): Promise<Category> => {
    return api.delete<Category>(`${API_ROUTES.ADMIN.CATEGORIES}/${catId}`, {
      params: force ? { force: "true" } : undefined,
    });
  },
};
