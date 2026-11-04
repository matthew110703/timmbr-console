export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type ProductWorkspaceTab =
  "info" | "attributes" | "variants" | "media" | "inventory";

export type VariantStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface ProductCoverImage {
  id: string;
  url: string;
  altText?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription: string;
  status: ProductStatus;
  hsnCode?: string | null;
  gstRate?: number;
  brandId?: string | null;
  brand?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  coverImage?: ProductCoverImage | null;
  price?: number | null;
  compareAtPrice?: number | null;
  currency?: string | null;
  hasMultipleVariants?: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
  categoryId?: string;
  brandId?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface VariantAvailability {
  status: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED" | "HIDDEN";
  quantity: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  isDefault: boolean;
  status: VariantStatus;
  currency: string;
  compareAtPrice: number | null;
  availability?: VariantAvailability;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  storageKey: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryRecord {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt?: string;
}

export type AttributeValuePayload = string | number | boolean | string[];

export interface AssignAttributeValueInput {
  definitionId: string;
  value: AttributeValuePayload;
}

export interface AttributeValueAssignment {
  id: string;
  definition: {
    id: string;
    name: string;
    type: string;
    scope: string;
    unit: string | null;
    isFilterable: boolean;
  };
  value: AttributeValuePayload;
  productId?: string | null;
  variantId?: string | null;
}

export interface PresignProductImageFile {
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface PresignedUploadFile {
  fileName?: string;
  key: string;
  storageKey?: string;
  uploadUrl: string;
  publicUrl?: string;
  expiresIn: number;
}

export interface PresignProductImagesResponse {
  files: PresignedUploadFile[];
}

export interface RegisterProductImageItem {
  storageKey: string;
  variantId?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  title: string;
  shortDescription: string;
  categoryId: string;
  description?: string;
  hsnCode?: string;
  gstRate?: number;
  brandId?: string;
}

export interface UpdateProductInput {
  title?: string;
  shortDescription?: string;
  description?: string | null;
  categoryId?: string;
  hsnCode?: string | null;
  gstRate?: number;
  brandId?: string | null;
  status?: ProductStatus;
}

export interface CreateVariantInput {
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  status?: VariantStatus;
  isDefault?: boolean;
}

export interface UpdateVariantInput {
  sku?: string;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  status?: VariantStatus;
  isDefault?: boolean;
}

export interface UpdateInventoryInput {
  quantity: number;
  reason?: string;
}
