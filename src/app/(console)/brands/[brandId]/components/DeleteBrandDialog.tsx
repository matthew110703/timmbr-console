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
} from "@timmbr/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import { brandApi } from "../../api";
import { revalidateBrands } from "../../actions";
import { strings } from "../../strings";
import type { Brand } from "../../types";

export interface DeleteBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand;
}

export const DeleteBrandDialog: React.FC<DeleteBrandDialogProps> = ({
  open,
  onOpenChange,
  brand,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setError(null);
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await brandApi.deleteBrand(brand.id);
      await revalidateBrands();
      handleOpenChange(false);
      router.push("/brands");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete brand. Please check if this brand has associated products.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

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
              Brand to be deleted
            </Text>
            <Inline gap={2} align="center">
              <Text
                variant="body-1"
                className="font-semibold text-foreground text-sm"
              >
                {brand.name}
              </Text>
              <span className="font-mono text-xs text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                /{brand.slug}
              </span>
            </Inline>
          </div>
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
            className="gap-2"
            leftIcon={<Icon icon={Trash2} size="sm" />}
          >
            {strings.detail.deleteModal.confirmButton}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
