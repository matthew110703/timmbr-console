import React from "react";
import { Skeleton, Card, CardContent, CardHeader } from "@timmbr/ui";

export default function OrderDetailLoading() {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <div className="shrink-0 space-y-2">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4 min-h-0 flex-1 overflow-hidden w-full">
        <div className="flex flex-col min-h-0 overflow-y-auto gap-4 pr-1">
          <Card>
            <CardHeader>
              <Skeleton variant="text" className="h-5 w-28" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton variant="text" className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-14 w-full rounded-lg"
                />
              ))}
            </CardContent>
          </Card>
        </div>
        <aside className="hidden xl:block min-h-0 min-w-0 w-full">
          <Card className="h-full w-full">
            <CardHeader>
              <Skeleton variant="text" className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
