"use client";

import * as React from "react";
import Link from "next/link";
import { Center, Card, EmptyState, Button } from "@timmbr/ui";
import { ShieldAlert } from "lucide-react";
import { strings } from "@/app/(console)/strings";

export function AccessDeniedView() {
  return (
    <Center className="flex-1 w-full h-full py-12">
      <Card
        variant="subtle"
        className="max-w-lg w-full p-8 flex items-center justify-center border border-dashed border-border rounded-2xl bg-card text-center"
      >
        <EmptyState
          fullWidth
          icon={<ShieldAlert className="size-10 text-destructive" />}
          title={strings.accessDenied.title}
          description={strings.accessDenied.description}
          action={
            <Button asChild variant="primary" size="md">
              <Link href="/overview">
                {strings.accessDenied.backToOverview}
              </Link>
            </Button>
          }
        />
      </Card>
    </Center>
  );
}
