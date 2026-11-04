"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { NewBrandDialog } from "./NewBrandDialog";

export interface NewBrandButtonProps {
  label?: string;
  variant?: "default" | "outline" | "secondary" | "primary" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const NewBrandButton: React.FC<NewBrandButtonProps> = ({
  label = "New Brand",
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

      <NewBrandDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};
