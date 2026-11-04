/**
 * API version configuration maintained centrally in the client.
 */
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Centralized static API endpoints matching the timmbr-core backend.
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VALIDATE_TOKEN: "/auth/validate-token",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  USER: {
    ME: "/user/me",
  },
  ADMIN: {
    USERS: "/admin/users",
    CATEGORIES: "/admin/categories",
    BRANDS: "/admin/brands",
    PRODUCTS: "/admin/products",
    ATTRIBUTE_DEFINITIONS: "/admin/attribute-definitions",
    PRODUCT_STATS: "/admin/products/stats",
  },
  MEDIA: {
    PRESIGNED_URL: "/media/presigned-url",
    URL: "/media/url",
    ROOT: "/media",
  },
  INVENTORY: {
    BY_VARIANT: (variantId: string) => `/admin/inventory/${variantId}`,
  },
} as const;

/** Path builders for product admin sub-resources (under ADMIN.PRODUCTS). */
export const productAdminRoutes = {
  byId: (productId: string) => `${API_ROUTES.ADMIN.PRODUCTS}/${productId}`,
  variants: (productId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/variants`,
  variant: (productId: string, variantId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/variants/${variantId}`,
  attributes: (productId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/attributes`,
  attributeByDefinition: (productId: string, definitionId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/attributes/${definitionId}`,
  variantAttributes: (productId: string, variantId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/variants/${variantId}/attributes`,
  variantAttributeByDefinition: (
    productId: string,
    variantId: string,
    definitionId: string,
  ) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/variants/${variantId}/attributes/${definitionId}`,
  imagesPresign: (productId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/images/presign`,
  images: (productId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/images`,
  imagePrimary: (productId: string, imageId: string) =>
    `${API_ROUTES.ADMIN.PRODUCTS}/${productId}/images/${imageId}/primary`,
} as const;

export type ApiRoutes = typeof API_ROUTES;
