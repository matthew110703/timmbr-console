import React from "react";
import { Grid, Stack, Inline, Heading, Text, Button } from "@timmbr/ui";
import { Plus } from "lucide-react";
import { CategoryCardSkeleton } from "./components";
import { strings } from "./strings";

export default function CategoriesLoading() {
  return (
    <Stack gap={6}>
      {/* ── Page Header Skeleton ── */}
      <Inline
        justify="between"
        align="center"
        className="pb-2 border-b border-grey-200/60"
      >
        <Stack gap={1}>
          <Heading
            level={1}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            {strings.header.title}
          </Heading>
          <Text variant="body-2" foreground="muted">
            {strings.header.subtitle}
          </Text>
        </Stack>

        <Button
          variant="default"
          size="sm"
          disabled
          leftIcon={<Plus className="size-4" />}
        >
          {strings.header.newCategory}
        </Button>
      </Inline>

      {/* ── Skeleton Grid ── */}
      <Grid cols={{ sm: 1, md: 1, lg: 2, xl: 3 }} gap={5}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CategoryCardSkeleton key={`skeleton-${index}`} />
        ))}
      </Grid>
    </Stack>
  );
}
