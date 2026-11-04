import React from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  Inline,
  Button,
} from "@timmbr/ui";
import { PageHeader } from "@/components";
import { strings } from "../strings";

export default function BrandDetailLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        breadcrumbs={<Skeleton variant="text" className="h-3.5 w-28" />}
        title={<Skeleton variant="text" className="h-7 w-40" />}
        action={
          <Inline gap={3}>
            <Button variant="default" size="default" disabled>
              {strings.detail.editBrand}
            </Button>
            <Button variant="outline" size="icon" disabled className="shrink-0">
              <Skeleton variant="text" className="size-4" />
            </Button>
          </Inline>
        }
      />

      <Card
        variant="outline"
        className="border-border/80 shadow-xs overflow-hidden"
      >
        <CardHeader className="border-b border-border bg-card/50 pb-4">
          <Skeleton variant="text" className="h-5 w-36" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card/80 border border-border/70">
            <Skeleton
              variant="rectangular"
              className="size-20 rounded-xl shrink-0"
            />
            <Stack gap={2} className="flex-1">
              <Skeleton variant="text" className="h-5 w-48" />
              <Skeleton variant="text" className="h-4 w-32" />
            </Stack>
          </div>
          <Stack gap={2}>
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </Stack>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <Skeleton variant="rectangular" className="h-14 rounded-lg" />
            <Skeleton variant="rectangular" className="h-14 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
}
