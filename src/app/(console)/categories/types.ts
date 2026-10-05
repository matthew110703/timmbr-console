export type CategoryStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DRAFT";

export interface Category {
  id: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  description: string | null;
  logoUrl: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  status?: CategoryStatus;
  search?: string;
  parentId?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  logoUrl?: string | null;
  status?: CategoryStatus;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  logoUrl?: string | null;
  status?: CategoryStatus;
}

export interface CategoryWithParent extends Category {
  parent?: Category | null;
}

export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
}
