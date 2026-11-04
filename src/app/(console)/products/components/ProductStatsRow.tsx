import React from "react";
import {
  Stat,
  StatLabel,
  StatValue,
  StatHelpText,
  StatIndicator,
} from "@timmbr/ui";
import { strings } from "../strings";
import type { ProductStats } from "../types";

export interface ProductStatsRowProps {
  stats: ProductStats;
}

export const ProductStatsRow: React.FC<ProductStatsRowProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Products */}
      <Stat variant="bordered" className="bg-card">
        <StatLabel>{strings.stats.total}</StatLabel>
        <StatValue>{stats.total.toLocaleString()}</StatValue>
        <StatHelpText>{strings.stats.totalHelp}</StatHelpText>
      </Stat>

      {/* 2. Active Products */}
      <Stat variant="bordered" className="bg-card">
        <StatLabel>{strings.stats.active}</StatLabel>
        <StatValue>{stats.active.toLocaleString()}</StatValue>
        <StatHelpText>
          <StatIndicator type="increase">
            {stats.total > 0
              ? `${Math.round((stats.active / stats.total) * 100)}%`
              : "0%"}
          </StatIndicator>
          <span className="ml-1 text-xs text-muted-foreground">
            {strings.stats.activeHelp}
          </span>
        </StatHelpText>
      </Stat>

      {/* 3. Draft Products */}
      <Stat variant="bordered" className="bg-card">
        <StatLabel>{strings.stats.draft}</StatLabel>
        <StatValue>{stats.draft.toLocaleString()}</StatValue>
        <StatHelpText>
          <span className="inline-flex items-center gap-1 text-body-3 font-semibold text-amber-600 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-500" />
            {stats.total > 0
              ? `${Math.round((stats.draft / stats.total) * 100)}%`
              : "0%"}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            {strings.stats.draftHelp}
          </span>
        </StatHelpText>
      </Stat>

      {/* 4. Archived Products */}
      <Stat variant="bordered" className="bg-card">
        <StatLabel>{strings.stats.archived}</StatLabel>
        <StatValue>{stats.archived.toLocaleString()}</StatValue>
        <StatHelpText>
          <span className="inline-flex items-center gap-1 text-body-3 font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-muted-foreground/60" />
            {stats.total > 0
              ? `${Math.round((stats.archived / stats.total) * 100)}%`
              : "0%"}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            {strings.stats.archivedHelp}
          </span>
        </StatHelpText>
      </Stat>
    </div>
  );
};
