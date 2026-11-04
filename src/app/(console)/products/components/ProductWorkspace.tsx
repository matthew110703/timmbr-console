"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Inline,
  Text,
  Tooltip,
  ConfirmDialog,
  toast,
} from "@timmbr/ui";
import { PageHeader } from "@/components";
import { ProductStatusBadge } from "./ProductStatusBadge";
import {
  ProductWorkspaceProvider,
  useProductWorkspace,
} from "./ProductWorkspaceContext";
import {
  ProductWorkspaceSummary,
  ProductWorkspaceSummaryMobile,
} from "./ProductWorkspaceSummary";
import { ProductInfoTab } from "./ProductInfoTab";
import { AttributesTab } from "./AttributesTab";
import { VariantsTab } from "./VariantsTab";
import { MediaTab } from "./MediaTab";
import { InventoryTab } from "./InventoryTab";
import { strings } from "../strings";
import type { Brand } from "../../brands/types";
import type { Category } from "../../categories/types";
import type {
  Product,
  ProductImage,
  ProductVariant,
  ProductWorkspaceTab,
} from "../types";
import { saveDirtyTabs } from "../lib/saveProductWorkspace";
import { publishProduct } from "../lib/publishProduct";
import { revalidateProduct } from "../actions";

const TAB_VALUES: ProductWorkspaceTab[] = [
  "info",
  "attributes",
  "variants",
  "media",
  "inventory",
];

export interface ProductWorkspaceProps {
  isCreateMode: boolean;
  initialProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  initialVariants?: ProductVariant[];
  initialImages?: ProductImage[];
}

const emptySubscribe = () => () => {};

function ProductWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const {
    isCreateMode,
    product,
    productId,
    activeTab,
    setActiveTab,
    dirtyTabs,
    getSaveHandlers,
    isSaving,
    setIsSaving,
  } = useProductWorkspace();

  const [publishOpen, setPublishOpen] = React.useState(false);

  const tabsLocked = isCreateMode && !productId;

  const handleTabChange = (value: string) => {
    const tab = value as ProductWorkspaceTab;
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    const path = productId ? `/products/${productId}` : "/products/new";
    router.replace(`${path}?${params.toString()}`);
  };

  const hasDirty = useMemo(
    () => Object.values(dirtyTabs).some(Boolean),
    [dirtyTabs],
  );

  const saveDisabled = !hasMounted || isSaving || !hasDirty;
  const publishDisabled = !hasMounted || isSaving || !productId;

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveDirtyTabs(dirtyTabs, getSaveHandlers());
    setIsSaving(false);

    if (result.ok) {
      toast.success(strings.toasts.updateSuccess);
      if (isCreateMode && productId) {
        router.replace(`/products/${productId}?tab=variants`);
      }
      await revalidateProduct(productId ?? undefined);
    } else if (result.failedTab) {
      toast.error(strings.toasts.error);
      handleTabChange(result.failedTab);
    }
  };

  const handlePublish = async () => {
    if (!productId) return;
    setIsSaving(true);
    try {
      const saveResult = await saveDirtyTabs(dirtyTabs, getSaveHandlers());
      if (!saveResult.ok) {
        toast.error(strings.toasts.error);
        return;
      }
      await publishProduct(productId);
      toast.success(strings.toasts.publishSuccess);
      await revalidateProduct(productId);
      router.refresh();
    } catch {
      toast.error(strings.toasts.error);
    } finally {
      setIsSaving(false);
      setPublishOpen(false);
    }
  };

  const title = product?.title ?? strings.workspace.newTitle;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2">
      <PageHeader
        level={2}
        className="shrink-0"
        breadcrumbs={
          <Inline gap={1} align="center" className="text-xs">
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground"
            >
              {strings.workspace.breadcrumbProducts}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="truncate">{title}</span>
          </Inline>
        }
        title={title}
        badge={
          product ? <ProductStatusBadge status={product.status} /> : undefined
        }
        description={
          isCreateMode ? strings.workspace.createSubtitle : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        variant="underline"
        className="flex flex-1 min-h-0 flex-col"
      >
        <TabsList className="shrink-0">
          {TAB_VALUES.map((tab) => {
            const disabled = tabsLocked && tab !== "info";
            const label = strings.workspace.tabs[tab];
            const dirty = dirtyTabs[tab];
            const trigger = (
              <TabsTrigger value={tab} disabled={disabled} className="text-sm">
                {label}
                {dirty ? <span className="ml-1 text-primary">•</span> : null}
              </TabsTrigger>
            );
            if (disabled) {
              return (
                <Tooltip key={tab} content={strings.workspace.tabLockedTooltip}>
                  <span className="inline-flex">{trigger}</span>
                </Tooltip>
              );
            }
            return <React.Fragment key={tab}>{trigger}</React.Fragment>;
          })}
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 min-h-0 flex-1 overflow-hidden pt-2">
          <div className="flex flex-col min-h-0 overflow-y-auto pr-1">
            <ProductWorkspaceSummaryMobile />
            <TabsContent value="info" className="mt-0">
              <ProductInfoTab />
            </TabsContent>
            <TabsContent value="attributes" className="mt-0">
              <AttributesTab />
            </TabsContent>
            <TabsContent value="variants" className="mt-0">
              <VariantsTab />
            </TabsContent>
            <TabsContent value="media" className="mt-0">
              <MediaTab />
            </TabsContent>
            <TabsContent value="inventory" className="mt-0">
              <InventoryTab />
            </TabsContent>
          </div>
          <aside className="hidden lg:block min-h-0 overflow-y-auto">
            <ProductWorkspaceSummary />
          </aside>
        </div>
      </Tabs>

      <footer className="shrink-0 border-t border-border bg-card py-2 px-4">
        <Inline justify="between" align="center" className="w-full">
          <Text variant="caption" foreground="muted">
            {hasMounted && hasDirty ? strings.workspace.unsavedChanges : ""}
          </Text>
          <Inline gap={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push("/products")}
            >
              {strings.workspace.cancel}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={saveDisabled}
            >
              {strings.workspace.save}
            </Button>
            {product?.status === "DRAFT" || isCreateMode ? (
              <Button
                size="sm"
                onClick={() => setPublishOpen(true)}
                disabled={publishDisabled}
              >
                {strings.workspace.publish}
              </Button>
            ) : null}
          </Inline>
        </Inline>
      </footer>

      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title={strings.workspace.publishConfirmTitle}
        description={strings.workspace.publishConfirmBody}
        confirmLabel={strings.workspace.publish}
        cancelLabel={strings.workspace.cancel}
        onConfirm={handlePublish}
      />
    </div>
  );
}

export const ProductWorkspace: React.FC<ProductWorkspaceProps> = (props) => {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProductWorkspaceTab) || "info";

  return (
    <ProductWorkspaceProvider
      isCreateMode={props.isCreateMode}
      initialProduct={props.initialProduct}
      categories={props.categories}
      brands={props.brands}
      initialTab={TAB_VALUES.includes(initialTab) ? initialTab : "info"}
      initialVariants={props.initialVariants}
      initialImages={props.initialImages}
    >
      <ProductWorkspaceInner />
    </ProductWorkspaceProvider>
  );
};
