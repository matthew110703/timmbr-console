import React from "react";
import { Grid, Stack, Button, Skeleton } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components";
import { BrandCardSkeleton } from "./components";
import { strings } from "./strings";

export default function BrandsLoading() {
  return (
    <Stack gap={6}>
      <PageHeader
        title={<Skeleton variant="text" className="h-7 w-28" />}
        description={strings.header.subtitle}
        action={
          <Button
            variant="default"
            size="sm"
            disabled
            leftIcon={<Plus className="size-4" />}
          >
            {strings.header.newBrand}
          </Button>
        }
      />

      <div className="flex gap-2 border-b border-border pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className="h-8 w-20 rounded-md mb-1"
          />
        ))}
      </div>

      <Grid cols={{ sm: 1, md: 1, lg: 2, xl: 3 }} gap={5}>
        {Array.from({ length: 6 }).map((_, index) => (
          <BrandCardSkeleton key={`skeleton-${index}`} />
        ))}
      </Grid>
    </Stack>
  );
}
