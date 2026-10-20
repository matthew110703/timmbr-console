export type AttributeType =
  "STRING" | "INTEGER" | "DECIMAL" | "LIST" | "BOOLEAN";

export type AttributeScope = "PRODUCT" | "VARIANT";

export type FilterDisplay = "CHECKBOX" | "SWATCH" | "TOGGLE";

export interface AttributeOption {
  id: string;
  code?: number;
  definitionId: string;
  label: string;
  slug: string;
  swatchHex?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttributeDefinition {
  id: string;
  name: string;
  key?: string | null;
  type: AttributeType;
  unit?: string | null;
  scope: AttributeScope;
  isFilterable: boolean;
  displayType?: FilterDisplay;
  filterOrder: number;
  productId?: string | null;
  createdAt: string;
  updatedAt: string;
  options?: AttributeOption[];
  _count?: {
    values?: number;
    options?: number;
  };
}

export interface CreateAttributeDefinitionInput {
  name: string;
  key?: string;
  type: AttributeType;
  scope: AttributeScope;
  isFilterable?: boolean;
  unit?: string | null;
  displayType?: FilterDisplay;
  filterOrder?: number;
  productId?: null;
}

export interface UpdateAttributeDefinitionInput {
  name?: string;
  key?: string;
  type?: AttributeType;
  scope?: AttributeScope;
  isFilterable?: boolean;
  unit?: string | null;
  displayType?: FilterDisplay;
  filterOrder?: number;
}

export interface CreateAttributeOptionInput {
  label: string;
  slug?: string;
  swatchHex?: string | null;
  sortOrder?: number;
}

export interface UpdateAttributeOptionInput {
  label?: string;
  slug?: string;
  swatchHex?: string | null;
  sortOrder?: number;
}

export interface GetAttributeDefinitionsParams {
  page?: number;
  limit?: number;
  scope?: AttributeScope;
  type?: AttributeType;
  search?: string;
  isFilterable?: boolean;
}
