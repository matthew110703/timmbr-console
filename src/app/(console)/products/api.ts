import { api, API_ROUTES, productAdminRoutes } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AssignAttributeValueInput,
  AttributeValueAssignment,
  CreateProductInput,
  CreateVariantInput,
  GetProductsParams,
  InventoryRecord,
  PresignProductImageFile,
  PresignProductImagesResponse,
  Product,
  ProductImage,
  ProductStats,
  ProductVariant,
  RegisterProductImageItem,
  UpdateInventoryInput,
  UpdateProductInput,
  UpdateVariantInput,
} from "./types";

function normalizePaginated<T>(
  res: PaginatedResult<T> | T[],
): PaginatedResult<T> {
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

export const productApi = {
  getProducts: async (
    params?: GetProductsParams,
  ): Promise<PaginatedResult<Product>> => {
    const res = await api.get<PaginatedResult<Product> | Product[]>(
      API_ROUTES.ADMIN.PRODUCTS,
      {
        params: {
          page: params?.page,
          limit: params?.limit ?? 10,
          status: params?.status,
          search: params?.search,
          categoryId: params?.categoryId,
          brandId: params?.brandId,
          sortBy: params?.sortBy,
          order: params?.order,
        },
        next: { revalidate: 60, tags: ["products"] },
      },
    );
    return normalizePaginated(res);
  },

  getProduct: async (id: string): Promise<Product> => {
    return api.get<Product>(productAdminRoutes.byId(id), {
      next: { revalidate: 30, tags: [`product-${id}`] },
    });
  },

  createProduct: async (body: CreateProductInput): Promise<Product> => {
    return api.post<Product>(API_ROUTES.ADMIN.PRODUCTS, body);
  },

  updateProduct: async (
    id: string,
    body: UpdateProductInput,
  ): Promise<Product> => {
    return api.patch<Product>(productAdminRoutes.byId(id), body);
  },

  deleteProduct: async (id: string): Promise<Product> => {
    return api.delete<Product>(productAdminRoutes.byId(id));
  },

  bulkDeleteProducts: async (
    productIds: string[],
  ): Promise<{ deletedCount: number }> => {
    return api.delete<{ deletedCount: number }>(API_ROUTES.ADMIN.PRODUCTS, {
      body: { productIds },
    });
  },

  getStats: async (): Promise<ProductStats> => {
    return api.get<ProductStats>(API_ROUTES.ADMIN.PRODUCT_STATS, {
      next: { revalidate: 30, tags: ["product-stats"] },
    });
  },

  getVariants: async (productId: string): Promise<ProductVariant[]> => {
    const res = await api.get<
      | PaginatedResult<ProductVariant>
      | ProductVariant[]
      | { variants?: ProductVariant[] }
    >(productAdminRoutes.variants(productId), { params: { limit: 100 } });

    if (Array.isArray(res)) {
      return res;
    }
    if (res && typeof res === "object") {
      if ("data" in res && Array.isArray(res.data)) {
        return res.data;
      }
      if ("variants" in res && Array.isArray(res.variants)) {
        return res.variants;
      }
    }
    return [];
  },

  createVariant: async (
    productId: string,
    body: CreateVariantInput,
  ): Promise<ProductVariant> => {
    return api.post<ProductVariant>(
      productAdminRoutes.variants(productId),
      body,
    );
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    body: UpdateVariantInput,
  ): Promise<ProductVariant> => {
    return api.patch<ProductVariant>(
      productAdminRoutes.variant(productId, variantId),
      body,
    );
  },

  getProductAttributes: async (
    productId: string,
  ): Promise<AttributeValueAssignment[]> => {
    return api.get<AttributeValueAssignment[]>(
      productAdminRoutes.attributes(productId),
    );
  },

  assignProductAttribute: async (
    productId: string,
    body: AssignAttributeValueInput,
  ): Promise<AttributeValueAssignment> => {
    return api.post<AttributeValueAssignment>(
      productAdminRoutes.attributes(productId),
      body,
    );
  },

  removeProductAttribute: async (
    productId: string,
    definitionId: string,
  ): Promise<void> => {
    await api.delete(
      productAdminRoutes.attributeByDefinition(productId, definitionId),
    );
  },

  getVariantAttributes: async (
    productId: string,
    variantId: string,
  ): Promise<AttributeValueAssignment[]> => {
    return api.get<AttributeValueAssignment[]>(
      productAdminRoutes.variantAttributes(productId, variantId),
    );
  },

  assignVariantAttribute: async (
    productId: string,
    variantId: string,
    body: AssignAttributeValueInput,
  ): Promise<AttributeValueAssignment> => {
    return api.post<AttributeValueAssignment>(
      productAdminRoutes.variantAttributes(productId, variantId),
      body,
    );
  },

  removeVariantAttribute: async (
    productId: string,
    variantId: string,
    definitionId: string,
  ): Promise<void> => {
    await api.delete(
      productAdminRoutes.variantAttributeByDefinition(
        productId,
        variantId,
        definitionId,
      ),
    );
  },

  presignProductImages: async (
    productId: string,
    files: PresignProductImageFile[],
  ): Promise<PresignProductImagesResponse> => {
    return api.post<PresignProductImagesResponse>(
      productAdminRoutes.imagesPresign(productId),
      { files },
    );
  },

  registerProductImages: async (
    productId: string,
    images: RegisterProductImageItem[],
  ): Promise<{ images: ProductImage[] }> => {
    return api.post<{ images: ProductImage[] }>(
      productAdminRoutes.images(productId),
      { images },
    );
  },

  getProductImages: async (productId: string): Promise<ProductImage[]> => {
    const res = await api.get<
      | { images?: ProductImage[] }
      | PaginatedResult<ProductImage>
      | ProductImage[]
    >(productAdminRoutes.images(productId));

    if (Array.isArray(res)) {
      return res;
    }
    if (res && typeof res === "object") {
      if ("images" in res && Array.isArray(res.images)) {
        return res.images;
      }
      if ("data" in res && Array.isArray(res.data)) {
        return res.data;
      }
    }
    return [];
  },

  setPrimaryProductImage: async (
    productId: string,
    imageId: string,
  ): Promise<ProductImage> => {
    return api.patch<ProductImage>(
      productAdminRoutes.imagePrimary(productId, imageId),
    );
  },

  deleteProductImages: async (
    productId: string,
    imageIds: string[],
  ): Promise<{ deletedCount: number; deletedIds: string[] }> => {
    return api.delete<{ deletedCount: number; deletedIds: string[] }>(
      productAdminRoutes.images(productId),
      { body: { imageIds } },
    );
  },

  getInventory: async (variantId: string): Promise<InventoryRecord> => {
    return api.get<InventoryRecord>(API_ROUTES.INVENTORY.BY_VARIANT(variantId));
  },

  updateInventory: async (
    variantId: string,
    body: UpdateInventoryInput,
  ): Promise<InventoryRecord> => {
    return api.patch<InventoryRecord>(
      API_ROUTES.INVENTORY.BY_VARIANT(variantId),
      body,
    );
  },
};
