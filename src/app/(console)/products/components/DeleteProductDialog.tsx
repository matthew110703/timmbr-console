"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Alert,
  Text,
  Inline,
  Center,
  toast,
} from "@timmbr/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import { revalidateByTag } from "@/lib/cache";
import { productApi } from "../api";
import { strings } from "../strings";
import type { Product } from "../types";

export interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Single-delete mode — provide this for a single product. */
  product?: Product | null;
  /** Bulk-delete mode — provide selected IDs (mutually exclusive with `product`). */
  selectedIds?: string[];
  onSuccess?: () => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  selectedIds,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBulk = !product && !!selectedIds && selectedIds.length > 0;
  const count = selectedIds?.length ?? 0;

  if (!product && !isBulk) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setError(null);
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      if (isBulk) {
        await productApi.bulkDeleteProducts(selectedIds!);
        await Promise.all([
          revalidateByTag("products"),
          revalidateByTag("product-stats"),
        ]);
        toast.success(strings.bulkDelete.successToast(count, count));
        handleOpenChange(false);
        onSuccess?.();
      } else {
        await productApi.deleteProduct(product!.id);
        await Promise.all([
          revalidateByTag("products"),
          revalidateByTag("product-stats"),
        ]);
        toast.success(strings.toasts.deleteSuccess);
        handleOpenChange(false);
        onSuccess?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const title = isBulk ? strings.bulkDelete.title(count) : strings.delete.title;
  const description = isBulk
    ? strings.bulkDelete.description(count)
    : strings.delete.description(product!.title);
  const confirmLabel = isBulk
    ? strings.bulkDelete.confirm
    : strings.delete.confirm;
  const loadingText = isBulk
    ? strings.bulkDelete.deleting
    : strings.delete.deleting;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Center className="size-9 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5 text-destructive" />
            </Center>
            <AlertDialogTitle className="text-lg font-bold font-sans text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogBody className="space-y-3">
          {error && (
            <Alert variant="destructive" title="Deletion Failed">
              {error}
            </Alert>
          )}

          {!isBulk && product && (
            <div className="bg-card px-3.5 py-2.5 rounded-lg border border-border/80 space-y-1">
              <Text
                variant="caption"
                className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]"
              >
                Product
              </Text>
              <Inline gap={2} align="center">
                <Text
                  variant="body-1"
                  className="font-semibold text-foreground text-sm"
                >
                  {product.title}
                </Text>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  /{product.slug}
                </span>
              </Inline>
            </div>
          )}
        </AlertDialogBody>

        <AlertDialogFooter className="gap-2.5 pt-1 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            {strings.delete.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={isDeleting}
            loadingText={loadingText}
            className="gap-2"
            leftIcon={<Trash2 className="size-4" />}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
