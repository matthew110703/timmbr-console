import React from "react";
import { Stack, Skeleton } from "@timmbr/ui";
import { PageHeader } from "@/components/PageHeader";
import { strings } from "./strings";

export default function UsersLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        title={<Skeleton variant="text" className="h-7 w-32" />}
        description={strings.header.subtitle}
      />

      <div className="flex gap-4 border-b border-border pb-2">
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton variant="text" className="h-6 w-24" />
        <Skeleton variant="text" className="h-6 w-16" />
        <Skeleton variant="text" className="h-6 w-28" />
      </div>

      <div className="flex gap-3 justify-between items-center">
        <Skeleton
          variant="rectangular"
          className="h-9 w-full sm:w-72 rounded-md"
        />
        <Skeleton variant="rectangular" className="h-9 w-48 rounded-md" />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center gap-4">
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-28" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-14 border-b border-border last:border-b-0 px-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-3 min-w-[200px]">
              <Skeleton
                variant="circular"
                className="size-8 shrink-0 rounded-full"
              />
              <div className="space-y-1 flex-1">
                <Skeleton variant="text" className="h-4 w-28" />
                <Skeleton variant="text" className="h-3 w-36" />
              </div>
            </div>
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
            <Skeleton variant="rectangular" className="h-5 w-20 rounded-full" />
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Stack>
  );
}
