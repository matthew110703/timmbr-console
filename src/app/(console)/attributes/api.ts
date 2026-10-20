import { api, API_ROUTES } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AttributeDefinition,
  AttributeOption,
  CreateAttributeDefinitionInput,
  CreateAttributeOptionInput,
  GetAttributeDefinitionsParams,
  UpdateAttributeDefinitionInput,
  UpdateAttributeOptionInput,
} from "./types";

export const attributeApi = {
  getAttributeDefinitions: async (
    params?: GetAttributeDefinitionsParams,
  ): Promise<PaginatedResult<AttributeDefinition>> => {
    const res = await api.get<
      PaginatedResult<AttributeDefinition> | AttributeDefinition[]
    >(API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS, {
      params: {
        page: params?.page,
        limit: params?.limit ?? 20,
        scope: params?.scope,
        type: params?.type,
        search: params?.search,
        isFilterable: params?.isFilterable,
      },
      next: { revalidate: 60, tags: ["attributes"] },
    });

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

  getAttributeDefinitionById: async (
    id: string,
  ): Promise<AttributeDefinition> => {
    return api.get<AttributeDefinition>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${id}`,
      {
        next: { revalidate: 30, tags: [`attribute-${id}`] },
      },
    );
  },

  createAttributeDefinition: async (
    body: CreateAttributeDefinitionInput,
  ): Promise<AttributeDefinition> => {
    return api.post<AttributeDefinition>(
      API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS,
      body,
    );
  },

  updateAttributeDefinition: async (
    id: string,
    body: UpdateAttributeDefinitionInput,
  ): Promise<AttributeDefinition> => {
    return api.patch<AttributeDefinition>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${id}`,
      body,
    );
  },

  deleteAttributeDefinition: async (id: string): Promise<null> => {
    return api.delete<null>(`${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${id}`);
  },

  getOptions: async (definitionId: string): Promise<AttributeOption[]> => {
    return api.get<AttributeOption[]>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${definitionId}/options`,
    );
  },

  createOption: async (
    definitionId: string,
    body: CreateAttributeOptionInput,
  ): Promise<AttributeOption> => {
    return api.post<AttributeOption>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${definitionId}/options`,
      body,
    );
  },

  updateOption: async (
    definitionId: string,
    optionId: string,
    body: UpdateAttributeOptionInput,
  ): Promise<AttributeOption> => {
    return api.patch<AttributeOption>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${definitionId}/options/${optionId}`,
      body,
    );
  },

  deleteOption: async (
    definitionId: string,
    optionId: string,
  ): Promise<null> => {
    return api.delete<null>(
      `${API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS}/${definitionId}/options/${optionId}`,
    );
  },
};
