export type BrandStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  status: BrandStatus;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  status?: BrandStatus;
  search?: string;
}

export interface CreateBrandInput {
  name: string;
  description?: string;
  logoUrl?: string | null;
  status?: BrandStatus;
}

export interface UpdateBrandInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  status?: BrandStatus;
}
