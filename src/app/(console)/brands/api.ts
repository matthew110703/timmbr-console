import { api, API_ROUTES } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  Brand,
  CreateBrandInput,
  GetBrandsParams,
  UpdateBrandInput,
} from "./types";

export const brandApi = {
  getBrands: async (
    params?: GetBrandsParams,
  ): Promise<PaginatedResult<Brand>> => {
    const res = await api.get<PaginatedResult<Brand> | Brand[]>(
      API_ROUTES.ADMIN.BRANDS,
      {
        params: {
          page: params?.page,
          limit: params?.limit ?? 20,
          status: params?.status,
          search: params?.search,
        },
        next: { revalidate: 60, tags: ["brands"] },
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

  getBrandById: async (brandId: string): Promise<Brand> => {
    return api.get<Brand>(`${API_ROUTES.ADMIN.BRANDS}/${brandId}`, {
      next: { revalidate: 30, tags: [`brand-${brandId}`] },
    });
  },

  createBrand: async (dto: CreateBrandInput): Promise<Brand> => {
    return api.post<Brand>(API_ROUTES.ADMIN.BRANDS, {
      name: dto.name,
      description: dto.description || undefined,
      logoUrl: dto.logoUrl || undefined,
      status: dto.status ?? "ACTIVE",
    });
  },

  updateBrand: async (
    brandId: string,
    dto: UpdateBrandInput,
  ): Promise<Brand> => {
    const payload: Record<string, unknown> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.logoUrl !== undefined) payload.logoUrl = dto.logoUrl;
    if (dto.status !== undefined) payload.status = dto.status;

    return api.patch<Brand>(`${API_ROUTES.ADMIN.BRANDS}/${brandId}`, payload);
  },

  deleteBrand: async (brandId: string): Promise<Brand> => {
    return api.delete<Brand>(`${API_ROUTES.ADMIN.BRANDS}/${brandId}`);
  },
};
