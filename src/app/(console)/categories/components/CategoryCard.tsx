import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  Badge,
  Text,
  Center,
  Inline,
  Stack,
} from "@timmbr/ui";
import { Calendar, Tags } from "lucide-react";
import type { Category, CategoryStatus } from "../types";
import { strings } from "../strings";

export interface CategoryCardProps {
  category: Category;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return isoString;
  }
}

function getStatusBadgeProps(status: CategoryStatus): {
  variant: "success" | "subtle" | "secondary" | "outline";
  label: string;
} {
  switch (status) {
    case "ACTIVE":
      return { variant: "success", label: strings.card.status.active };
    case "INACTIVE":
      return { variant: "subtle", label: strings.card.status.inactive };
    case "DRAFT":
      return { variant: "secondary", label: strings.card.status.draft };
    case "ARCHIVED":
      return { variant: "outline", label: strings.card.status.archived };
    default:
      return { variant: "subtle", label: status };
  }
}

/**
 * Horizontal Category Card:
 * - Image / thumbnail on the left
 * - Details (title, slug, status badge, description, created timestamp) on the right
 * - Clickable card navigating to `/categories/${category.id}`
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const formattedDate = formatDate(category.createdAt);
  const statusBadge = getStatusBadgeProps(category.status);

  return (
    <Link
      href={`/categories/${category.id}`}
      className="block group/link h-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`View details for ${category.name}`}
    >
      <Card
        variant="outline"
        padding="none"
        className="group flex flex-col sm:flex-row h-full overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer"
        data-testid="category-card"
      >
        {/* ── Left: Image / Thumbnail ── */}
        <div className="w-full sm:w-40 md:w-44 shrink-0 relative bg-stone-100 border-b sm:border-b-0 sm:border-r border-grey-100 overflow-hidden flex items-center justify-center min-h-[140px] sm:min-h-full">
          {category.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.logoUrl}
              alt={category.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Center className="h-full w-full p-4 select-none">
              <Center className="size-12 rounded-xl bg-white border border-grey-200 shadow-xs text-primary transition-transform duration-200 group-hover:scale-110">
                <Tags className="size-6 text-primary" />
              </Center>
            </Center>
          )}
        </div>

        {/* ── Right: Details ── */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5 min-w-0">
          <Stack gap={2}>
            {/* Header Row: Title & Status Badge */}
            <Inline justify="between" align="start" gap={2} wrap={false}>
              <Stack gap={0.5} className="min-w-0 flex-1">
                <Text
                  variant="body-1"
                  className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-base"
                  title={category.name}
                >
                  {category.name}
                </Text>
                <Text
                  variant="caption"
                  foreground="muted"
                  className="font-mono text-[11px] truncate"
                >
                  /{category.slug}
                </Text>
              </Stack>

              <Badge
                variant={statusBadge.variant}
                size="sm"
                dot={category.status === "ACTIVE"}
                className="shrink-0 font-medium"
              >
                {statusBadge.label}
              </Badge>
            </Inline>

            {/* Description */}
            <Text
              variant="caption"
              foreground="muted"
              className="line-clamp-2 leading-relaxed text-xs"
              title={category.description || undefined}
            >
              {category.description || strings.card.noDescription}
            </Text>
          </Stack>

          {/* Footer: Timestamp & Subcategory */}
          <CardFooter className="pt-3 mt-1 border-t border-grey-100">
            <Inline justify="between" align="center" className="w-full">
              <Inline gap={2} align="center">
                <Calendar className="size-3.5 text-grey-400 shrink-0" />
                <Text variant="caption" foreground="muted" className="text-xs">
                  {formattedDate}
                </Text>
              </Inline>

              {category.parentId && (
                <Badge
                  variant="subtle"
                  size="sm"
                  className="text-[11px] font-medium text-grey-700 bg-grey-100 border border-grey-200/70 shrink-0"
                >
                  Subcategory
                </Badge>
              )}
            </Inline>
          </CardFooter>
        </CardContent>
      </Card>
    </Link>
  );
};
