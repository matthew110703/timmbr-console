import React from "react";
import { Stack, Button, Skeleton } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components";
import { strings } from "./strings";

export default function ProductsLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        title={<Skeleton variant="text" className="h-7 w-36" />}
        description={strings.header.subtitle}
        action={
          <Button
            variant="default"
            size="sm"
            disabled
            leftIcon={<Plus className="size-4" />}
          >
            {strings.header.newProduct}
          </Button>
        }
      />

      {/* ── 4 Stat Cards Skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-2"
          >
            <Skeleton variant="text" className="h-3.5 w-24" />
            <Skeleton variant="text" className="h-8 w-16" />
            <Skeleton variant="text" className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* ── Toolbar Skeleton ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton
          variant="rectangular"
          className="h-9 w-full sm:w-72 rounded-md"
        />
        <Skeleton variant="rectangular" className="h-9 w-40 rounded-md" />
      </div>

      {/* ── Table Skeleton ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-8">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-16 border-b border-border last:border-b-0 px-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
              <Skeleton variant="rectangular" className="size-11 rounded-lg" />
              <div className="space-y-1">
                <Skeleton variant="text" className="h-4 w-40" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton
                variant="rectangular"
                className="h-5 w-16 rounded-full"
              />
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Stack>
  );
}
