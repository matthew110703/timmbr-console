import { Stack, Skeleton } from "@timmbr/ui";

export default function NewProductLoading() {
  return (
    <Stack gap={4} className="flex-1 min-h-0 p-1">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="flex-1 min-h-[320px] w-full" />
      <Skeleton className="h-10 w-full" />
    </Stack>
  );
}
