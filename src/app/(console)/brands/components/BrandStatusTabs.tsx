"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@timmbr/ui";
import type { BrandStatus } from "../types";
import { strings } from "../strings";

const STATUS_TABS: { label: string; value: BrandStatus | "ALL" }[] = [
  { label: strings.tabs.all, value: "ALL" },
  { label: strings.tabs.active, value: "ACTIVE" },
  { label: strings.tabs.inactive, value: "INACTIVE" },
  { label: strings.tabs.archived, value: "ARCHIVED" },
];

export interface BrandStatusTabsProps {
  activeStatus?: BrandStatus;
}

export const BrandStatusTabs: React.FC<BrandStatusTabsProps> = ({
  activeStatus,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = activeStatus ?? "ALL";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    const qs = params.toString();
    router.push(qs ? `/brands?${qs}` : "/brands");
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} variant="underline">
      <TabsList>
        {STATUS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
