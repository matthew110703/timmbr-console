import { Stack, Skeleton } from "@timmbr/ui";

export default function ProductEditLoading() {
  return (
    <Stack gap={4} className="flex-1 min-h-0 p-1">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-8 w-full max-w-2xl" />
      <Skeleton className="flex-1 min-h-[320px] w-full" />
      <Skeleton className="h-10 w-full" />
    </Stack>
  );
}
