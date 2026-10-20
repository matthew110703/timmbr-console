import React from "react";
import { Stack, Button, Skeleton } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components";
import { strings } from "./strings";

export default function AttributesLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        title={<Skeleton variant="text" className="h-7 w-48" />}
        description={strings.header.subtitle}
        action={
          <Button
            variant="default"
            size="sm"
            disabled
            leftIcon={<Plus className="size-4" />}
          >
            {strings.header.newAttribute}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton
          variant="rectangular"
          className="h-9 w-full sm:w-72 rounded-md"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton variant="rectangular" className="h-9 w-32 rounded-md" />
          <Skeleton variant="rectangular" className="h-9 w-32 rounded-md" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center gap-4">
          <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
          <Skeleton variant="text" className="h-4 w-28" />
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 border-b border-border last:border-b-0 px-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
              <div className="space-y-1">
                <Skeleton variant="text" className="h-4 w-36" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Skeleton
                variant="rectangular"
                className="h-5 w-16 rounded-full"
              />
              <Skeleton
                variant="rectangular"
                className="h-5 w-16 rounded-full"
              />
              <Skeleton variant="rectangular" className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </Stack>
  );
}
