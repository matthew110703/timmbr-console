import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  Skeleton,
  Stack,
  Inline,
} from "@timmbr/ui";

export const BrandCardSkeleton: React.FC = () => {
  return (
    <Card
      variant="outline"
      padding="none"
      className="flex flex-col sm:flex-row h-full overflow-hidden"
      aria-hidden="true"
    >
      <Skeleton
        variant="rectangular"
        className="w-full sm:w-40 md:w-44 h-36 sm:h-full shrink-0"
      />

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <Stack gap={2}>
          <Inline justify="between" align="start" gap={2}>
            <Stack gap={1} className="w-3/5">
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </Stack>
            <Skeleton variant="text" className="h-5 w-14 rounded-full" />
          </Inline>

          <Stack gap={1} className="pt-1">
            <Skeleton variant="text" className="h-3 w-full" />
            <Skeleton variant="text" className="h-3 w-4/5" />
          </Stack>
        </Stack>

        <CardFooter className="pt-3 mt-1 border-t border-border">
          <Inline gap={2} align="center">
            <Skeleton variant="text" className="h-3.5 w-24" />
          </Inline>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
