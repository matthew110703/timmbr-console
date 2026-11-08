import React from "react";
import { Stack, Skeleton } from "@timmbr/ui";
import { PageHeader } from "@/components";
import { strings } from "./strings";

export default function OrdersLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        title={<Skeleton variant="text" className="h-7 w-32" />}
        description={strings.header.subtitle}
      />

      <Skeleton
        variant="rectangular"
        className="h-9 w-full sm:w-72 rounded-md"
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center gap-4">
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-28" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-12" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 border-b border-border last:border-b-0 px-4 flex items-center gap-6"
          >
            <Skeleton variant="text" className="h-4 w-24" />
            <div className="space-y-1 flex-1">
              <Skeleton variant="text" className="h-4 w-36" />
              <Skeleton variant="text" className="h-3 w-40" />
            </div>
            <Skeleton variant="rectangular" className="h-5 w-20 rounded-full" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Stack>
  );
}
