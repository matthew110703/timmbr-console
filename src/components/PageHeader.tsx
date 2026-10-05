import * as React from "react";
import { Stack, Inline, Heading, Text } from "@timmbr/ui";
import { cn } from "@timmbr/utils";

export interface PageHeaderProps {
  /** Main title of the page */
  title: React.ReactNode;
  /** Optional subtitle or description text */
  description?: React.ReactNode;
  /** Optional breadcrumbs or back-link element rendered above the title */
  breadcrumbs?: React.ReactNode;
  /** Optional badge or status tag rendered inline next to the title */
  badge?: React.ReactNode;
  /** Optional action elements (e.g. primary button, filter controls) on the right */
  action?: React.ReactNode;
  /** Heading semantic level (1, 2, or 3, default: 1) */
  level?: 1 | 2 | 3;
  /** Optional container class name for custom styling */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  action,
  level = 1,
  className,
}) => {
  return (
    <header className={cn("w-full select-none", className)}>
      <Inline justify="between" align="center" gap={4} wrap className="w-full">
        <Stack gap={1} className="min-w-0 flex-1">
          {breadcrumbs && (
            <div className="text-xs text-muted mb-0.5">{breadcrumbs}</div>
          )}
          <Inline gap={3} align="center" className="min-w-0 flex-wrap">
            <Heading
              level={level}
              className="text-2xl font-bold tracking-tight text-foreground truncate"
            >
              {title}
            </Heading>
            {badge && <div className="shrink-0">{badge}</div>}
          </Inline>
          {description && (
            <Text
              variant="body-2"
              foreground="muted"
              className="leading-normal"
            >
              {description}
            </Text>
          )}
        </Stack>

        {action && (
          <div className="shrink-0 flex items-center gap-3">{action}</div>
        )}
      </Inline>
    </header>
  );
};
