"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Tooltip } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { usePermission } from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS } from "@/lib/auth/permissions";
import { strings } from "../strings";
import type { Category } from "../types";
import { NewCategoryDialog } from "./NewCategoryDialog";

export interface NewCategoryButtonProps {
  categories?: Category[];
  label?: string;
  variant?: "default" | "outline" | "secondary" | "primary" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const NewCategoryButton: React.FC<NewCategoryButtonProps> = ({
  categories = [],
  label = "New Category",
  variant = "default",
  size = "sm",
}) => {
  const router = useRouter();
  const canWrite = usePermission(CONSOLE_PERMISSIONS.CATALOG_WRITE);
  const [open, setOpen] = useState(false);

  return (
    <>
      {!canWrite ? (
        <Tooltip content={strings.permissions.createCategoryRequired}>
          <span className="inline-flex">
            <Button
              variant={variant}
              size={size}
              disabled
              leftIcon={<Plus className="size-4" />}
            >
              {label}
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={() => setOpen(true)}
          leftIcon={<Plus className="size-4" />}
        >
          {label}
        </Button>
      )}

      <NewCategoryDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};
