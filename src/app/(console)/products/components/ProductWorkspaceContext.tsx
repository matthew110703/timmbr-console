"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Brand } from "../../brands/types";
import type { Category } from "../../categories/types";
import type {
  Product,
  ProductImage,
  ProductVariant,
  ProductWorkspaceTab,
} from "../types";
import type { TabSaveHandler } from "../lib/saveProductWorkspace";

export interface ProductWorkspaceContextValue {
  isCreateMode: boolean;
  productId: string | null;
  product: Product | null;
  setProduct: (product: Product) => void;
  setProductId: (id: string) => void;
  categories: Category[];
  brands: Brand[];
  activeTab: ProductWorkspaceTab;
  setActiveTab: (tab: ProductWorkspaceTab) => void;
  dirtyTabs: Record<ProductWorkspaceTab, boolean>;
  setTabDirty: (tab: ProductWorkspaceTab, dirty: boolean) => void;
  registerSaveHandler: (
    tab: ProductWorkspaceTab,
    handler: TabSaveHandler,
  ) => void;
  getSaveHandlers: () => Partial<Record<ProductWorkspaceTab, TabSaveHandler>>;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  images: ProductImage[];
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const defaultDirty: Record<ProductWorkspaceTab, boolean> = {
  info: false,
  attributes: false,
  variants: false,
  media: false,
  inventory: false,
};

const ProductWorkspaceContext =
  createContext<ProductWorkspaceContextValue | null>(null);

export function useProductWorkspace(): ProductWorkspaceContextValue {
  const ctx = useContext(ProductWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useProductWorkspace must be used within ProductWorkspaceProvider",
    );
  }
  return ctx;
}

export interface ProductWorkspaceProviderProps {
  children: React.ReactNode;
  isCreateMode: boolean;
  initialProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  initialTab: ProductWorkspaceTab;
  initialVariants?: ProductVariant[];
  initialImages?: ProductImage[];
}

export const ProductWorkspaceProvider: React.FC<
  ProductWorkspaceProviderProps
> = ({
  children,
  isCreateMode,
  initialProduct,
  categories,
  brands,
  initialTab,
  initialVariants = [],
  initialImages = [],
}) => {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [productId, setProductId] = useState<string | null>(
    initialProduct?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<ProductWorkspaceTab>(initialTab);
  const [dirtyTabs, setDirtyTabs] =
    useState<Record<ProductWorkspaceTab, boolean>>(defaultDirty);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [isSaving, setIsSaving] = useState(false);

  const saveHandlersRef = useRef<
    Partial<Record<ProductWorkspaceTab, TabSaveHandler>>
  >({});

  const setTabDirty = useCallback(
    (tab: ProductWorkspaceTab, dirty: boolean) => {
      setDirtyTabs((prev) =>
        prev[tab] === dirty ? prev : { ...prev, [tab]: dirty },
      );
    },
    [],
  );

  const registerSaveHandler = useCallback(
    (tab: ProductWorkspaceTab, handler: TabSaveHandler) => {
      saveHandlersRef.current[tab] = handler;
    },
    [],
  );

  const getSaveHandlers = useCallback(() => saveHandlersRef.current, []);

  const value = useMemo(
    () => ({
      isCreateMode,
      productId,
      product,
      setProduct,
      setProductId,
      categories,
      brands,
      activeTab,
      setActiveTab,
      dirtyTabs,
      setTabDirty,
      registerSaveHandler,
      variants,
      setVariants,
      images,
      setImages,
      isSaving,
      setIsSaving,
      getSaveHandlers,
    }),
    [
      isCreateMode,
      productId,
      product,
      categories,
      brands,
      activeTab,
      dirtyTabs,
      setTabDirty,
      registerSaveHandler,
      getSaveHandlers,
      variants,
      images,
      isSaving,
    ],
  );

  return (
    <ProductWorkspaceContext.Provider value={value}>
      {children}
    </ProductWorkspaceContext.Provider>
  );
};
