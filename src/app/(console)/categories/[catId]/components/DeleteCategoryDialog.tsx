"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Icon,
  Alert,
  Text,
  Inline,
  Center,
  Switch,
} from "@timmbr/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import { categoryApi } from "../../api";
import { revalidateCategories } from "../../actions";
import { strings } from "../../strings";
import type { CategoryWithParent } from "../../types";

export interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithParent;
  hasChildren?: boolean;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  hasChildren = false,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceConfirmed, setForceConfirmed] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
      setForceConfirmed(false);
    }
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await categoryApi.deleteCategory(
        category.id,
        hasChildren && forceConfirmed,
      );
      await revalidateCategories();
      handleOpenChange(false);
      router.push("/categories");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete category. Please check if this category has associated products or children.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = !hasChildren || forceConfirmed;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Center className="size-9 rounded-full bg-destructive/10 text-destructive shrink-0">
              <Icon
                icon={AlertTriangle}
                size="sm"
                className="text-destructive"
              />
            </Center>
            <AlertDialogTitle className="text-lg font-bold font-sans text-foreground">
              {strings.detail.deleteModal.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {strings.detail.deleteModal.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogBody className="space-y-3">
          {error && (
            <Alert variant="destructive" title="Deletion Failed">
              {error}
            </Alert>
          )}

          <div className="bg-card px-3.5 py-2.5 rounded-lg border border-border/80 space-y-1">
            <Text
              variant="caption"
              className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]"
            >
              Category to be deleted
            </Text>
            <Inline gap={2} align="center">
              <Text
                variant="body-1"
                className="font-semibold text-foreground text-sm"
              >
                {category.name}
              </Text>
              <span className="font-mono text-xs text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                /{category.slug}
              </span>
            </Inline>
          </div>

          {hasChildren && (
            <div className="space-y-3">
              <Alert variant="warning" title="Nested Subcategories Detected">
                <Text variant="caption">
                  {strings.detail.deleteModal.hasChildrenWarning}
                </Text>
              </Alert>
              <div className="px-3.5 py-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <Switch
                  label={strings.detail.deleteModal.forceDeleteLabel}
                  description={
                    strings.detail.deleteModal.forceDeleteDescription
                  }
                  checked={forceConfirmed}
                  onCheckedChange={setForceConfirmed}
                  disabled={isDeleting}
                />
              </div>
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
            {strings.detail.deleteModal.cancelButton}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={isDeleting}
            loadingText={strings.detail.deleteModal.deleting}
            disabled={!canDelete}
            className="gap-2"
            leftIcon={<Icon icon={Trash2} size="sm" />}
          >
            {hasChildren && forceConfirmed
              ? strings.detail.deleteModal.confirmButtonForce
              : strings.detail.deleteModal.confirmButton}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
