import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  Stack,
  Inline,
} from "@timmbr/ui";

export default function CategoryDetailLoading() {
  return (
    <Stack gap={6}>
      {/* ── Top Bar Skeleton ── */}
      <div>
        <Inline justify="between" align="center">
          <Stack gap={2}>
            <Skeleton className="h-3 w-28 rounded-md" />
            <Inline gap={3} align="center">
              <Skeleton className="h-8 w-56 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </Inline>
          </Stack>
          <Inline gap={2.5} align="center">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </Inline>
        </Inline>
      </div>

      {/* ── 2-Column Responsive Layout Skeleton ── */}
      <div className="category-detail-layout">
        {/* Left Column Skeleton */}
        <div className="w-full min-w-0">
          <Card variant="outline" className="border-grey-200/80 bg-white">
            <CardHeader className="border-b border-grey-100 pb-4">
              <Inline justify="between" align="center">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </Inline>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-grey-50">
                <Skeleton className="size-20 rounded-xl" />
                <Stack gap={2} className="flex-1">
                  <Skeleton className="h-6 w-48 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </Stack>
              </div>
              <Stack gap={2}>
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </Stack>
            </CardContent>
          </Card>
        </div>

        {/* Right Column Hierarchy Skeleton */}
        <div className="w-full lg:flex-1 min-w-0">
          <Card variant="outline" className="border-grey-200/80 bg-white">
            <CardHeader className="border-b border-grey-100 pb-4">
              <Skeleton className="h-5 w-48 rounded-md" />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </Stack>
  );
}
