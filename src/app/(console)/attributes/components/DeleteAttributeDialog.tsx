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
import { attributeApi } from "../api";
import { strings } from "../strings";
import type { AttributeDefinition } from "../types";

export interface DeleteAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Single-delete mode — provide this for a single attribute. */
  attribute?: AttributeDefinition | null;
  /** Bulk-delete mode — provide selected IDs (mutually exclusive with `attribute`). */
  selectedIds?: string[];
  onSuccess?: () => void;
}

export const DeleteAttributeDialog: React.FC<DeleteAttributeDialogProps> = ({
  open,
  onOpenChange,
  attribute,
  selectedIds,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBulk = !attribute && !!selectedIds && selectedIds.length > 0;
  const count = selectedIds?.length ?? 0;

  // Bail out if neither mode has valid data
  if (!attribute && !isBulk) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setError(null);
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      if (isBulk) {
        const results = await Promise.allSettled(
          selectedIds!.map((id) => attributeApi.deleteAttributeDefinition(id)),
        );
        const succeeded = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        await revalidateByTag("attributes");
        toast.success(strings.bulkDelete.successToast(succeeded, count));
        handleOpenChange(false);
        onSuccess?.();
      } else {
        await attributeApi.deleteAttributeDefinition(attribute!.id);
        await revalidateByTag("attributes");
        toast.success(strings.toasts.deleteSuccess);
        handleOpenChange(false);
        onSuccess?.();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete attribute. It may be in use by products.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const title = isBulk ? strings.bulkDelete.title(count) : strings.delete.title;
  const description = isBulk
    ? strings.bulkDelete.description(count)
    : strings.delete.description(attribute!.name);
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

          {!isBulk && attribute && (
            <div className="bg-card px-3.5 py-2.5 rounded-lg border border-border/80 space-y-1">
              <Text
                variant="caption"
                className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]"
              >
                Attribute Definition
              </Text>
              <Inline gap={2} align="center">
                <Text
                  variant="body-1"
                  className="font-semibold text-foreground text-sm"
                >
                  {attribute.name}
                </Text>
                {attribute.key && (
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                    {attribute.key}
                  </span>
                )}
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
