"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@timmbr/ui";
import { Plus } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        leftIcon={<Plus className="size-4" />}
      >
        {label}
      </Button>

      <NewCategoryDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};
