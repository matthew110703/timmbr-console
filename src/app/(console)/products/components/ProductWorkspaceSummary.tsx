"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Card,
  Stack,
  Text,
  Inline,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@timmbr/ui";
import { ListingReadinessPanel } from "./ListingReadinessPanel";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { useProductWorkspace } from "./ProductWorkspaceContext";
import { strings } from "../strings";

export const ProductWorkspaceSummary: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { product, variants, images } = useProductWorkspace();

  const primaryImage =
    images.find((i) => i.isPrimary) || images[0] || product?.coverImage;

  return (
    <Card variant="subtle" className={`p-4 ${className || ""}`}>
      <Stack gap={4}>
        {/* Product Overview Header */}
        {product ? (
          <Stack gap={2.5} className="border-b border-border pb-3">
            {primaryImage?.url ? (
              <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted border border-border">
                <Image
                  src={primaryImage.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="260px"
                />
              </div>
            ) : null}

            <Inline justify="between" align="center" className="gap-2">
              <Text variant="caption" foreground="muted">
                Status
              </Text>
              <ProductStatusBadge status={product.status} />
            </Inline>

            {product.category?.name ? (
              <Inline justify="between" align="center" className="gap-2">
                <Text variant="caption" foreground="muted">
                  Category
                </Text>
                <Text
                  variant="caption"
                  className="font-medium text-foreground truncate"
                >
                  {product.category.name}
                </Text>
              </Inline>
            ) : null}

            {product.brand?.name ? (
              <Inline justify="between" align="center" className="gap-2">
                <Text variant="caption" foreground="muted">
                  Brand
                </Text>
                <Text
                  variant="caption"
                  className="font-medium text-foreground truncate"
                >
                  {product.brand.name}
                </Text>
              </Inline>
            ) : null}
          </Stack>
        ) : null}

        {/* Pre-flight Listing Readiness */}
        <ListingReadinessPanel
          product={product}
          variants={variants}
          images={images}
        />
      </Stack>
    </Card>
  );
};

export const ProductWorkspaceSummaryMobile: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-3">
      <Accordion
        type="single"
        collapsible
        value={open ? "overview" : ""}
        onValueChange={(v) => setOpen(v === "overview")}
      >
        <AccordionItem value="overview">
          <AccordionTrigger className="text-sm py-2">
            {strings.workspace.overview}
          </AccordionTrigger>
          <AccordionContent>
            <ProductWorkspaceSummary />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
