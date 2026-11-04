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
import { Calendar, Tag } from "lucide-react";
import type { Brand, BrandStatus } from "../types";
import { strings } from "../strings";

export interface BrandCardProps {
  brand: Brand;
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

function getStatusBadgeProps(status: BrandStatus): {
  variant: "success" | "subtle" | "outline";
  label: string;
} {
  switch (status) {
    case "ACTIVE":
      return { variant: "success", label: strings.card.status.active };
    case "INACTIVE":
      return { variant: "subtle", label: strings.card.status.inactive };
    case "ARCHIVED":
      return { variant: "outline", label: strings.card.status.archived };
    default:
      return { variant: "subtle", label: status };
  }
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  const formattedDate = formatDate(brand.createdAt);
  const statusBadge = getStatusBadgeProps(brand.status);

  return (
    <Link
      href={`/brands/${brand.id}`}
      className="block group/link h-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`View details for ${brand.name}`}
    >
      <Card
        variant="outline"
        padding="none"
        className="group flex flex-col sm:flex-row h-full overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer"
        data-testid="brand-card"
      >
        {/* ── Left: Logo / Thumbnail ── */}
        <div className="w-full sm:w-40 md:w-44 shrink-0 relative bg-accent/50 border-b sm:border-b-0 sm:border-r border-border overflow-hidden flex items-center justify-center min-h-[140px] sm:min-h-full">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Center className="h-full w-full p-4 select-none">
              <Center className="size-12 rounded-xl bg-card border border-border shadow-xs text-primary transition-transform duration-200 group-hover:scale-110">
                <Tag className="size-6 text-primary" />
              </Center>
            </Center>
          )}
        </div>

        {/* ── Right: Details ── */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5 min-w-0">
          <Stack gap={2}>
            <Inline justify="between" align="start" gap={2} wrap={false}>
              <Stack gap={0.5} className="min-w-0 flex-1">
                <Text
                  variant="body-1"
                  className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-base"
                  title={brand.name}
                >
                  {brand.name}
                </Text>
                <Text
                  variant="caption"
                  foreground="muted"
                  className="font-mono text-[11px] truncate"
                >
                  /{brand.slug}
                </Text>
              </Stack>

              <Badge
                variant={statusBadge.variant}
                size="sm"
                dot={brand.status === "ACTIVE"}
                className="shrink-0 font-medium"
              >
                {statusBadge.label}
              </Badge>
            </Inline>

            <Text
              variant="caption"
              foreground="muted"
              className="line-clamp-2 leading-relaxed text-xs"
              title={brand.description || undefined}
            >
              {brand.description || strings.card.noDescription}
            </Text>
          </Stack>

          <CardFooter className="pt-3 mt-1 border-t border-border">
            <Inline gap={2} align="center">
              <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
              <Text variant="caption" foreground="muted" className="text-xs">
                {formattedDate}
              </Text>
            </Inline>
          </CardFooter>
        </CardContent>
      </Card>
    </Link>
  );
};
