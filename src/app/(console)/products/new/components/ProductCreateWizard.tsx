"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stepper,
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  Button,
  Inline,
} from "@timmbr/ui";
import type { StepItem } from "@timmbr/ui";
import {
  Package,
  Tag,
  SlidersHorizontal,
  ImageIcon,
  Receipt,
} from "@timmbr/icons";
import { PageHeader } from "@/components";
import type { Category } from "@/app/(console)/categories/types";
import type { Brand } from "@/app/(console)/brands/types";
import { useProductDraft } from "../hooks/useProductDraft";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { AttributesStep } from "./steps/AttributesStep";
import { VariantsPricingStep } from "./steps/VariantsPricingStep";
import { MediaStep } from "./steps/MediaStep";
import { InventoryReviewStep } from "./steps/InventoryReviewStep";
import {
  ProductPreviewCard,
  type ProductPreviewData,
} from "./ProductPreviewCard";
import type { BasicInfoFormValues } from "../../validationSchema";

const WIZARD_STEPS: StepItem[] = [
  { label: "Basic Information", icon: <Package size={18} /> },
  { label: "Attributes", icon: <Tag size={18} /> },
  { label: "Variants & Pricing", icon: <SlidersHorizontal size={18} /> },
  { label: "Media", icon: <ImageIcon size={18} /> },
  { label: "Inventory & Review", icon: <Receipt size={18} /> },
];

interface ProductCreateWizardProps {
  categories: Category[];
  brands: Brand[];
}

export const ProductCreateWizard: React.FC<ProductCreateWizardProps> = ({
  categories,
  brands,
}) => {
  const router = useRouter();
  const draft = useProductDraft();

  const [currentStep, setCurrentStep] = useState(0);
  const [productId, setProductId] = useState<string | null>(null);

  // Clear stale draft storage on mount and unmount
  useEffect(() => {
    draft.clearDraft();
    return () => {
      draft.clearDraft();
    };
  }, [draft]);

  const [previewData, setPreviewData] = useState<Partial<ProductPreviewData>>(
    {},
  );
  const [priceDisplay, setPriceDisplay] = useState<string | null>(null);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);

  const handleBasicInfoCreated = useCallback(
    (id: string) => {
      draft.setDraftId(id);
      setProductId(id);
      setCurrentStep(1);
    },
    [draft],
  );

  const handlePreviewChange = useCallback(
    (values: Partial<BasicInfoFormValues>) => {
      setPreviewData((prev) => ({ ...prev, ...values }));
    },
    [],
  );

  const brandName = useMemo(() => {
    if (!previewData.brandId) return null;
    return brands.find((b) => b.id === previewData.brandId)?.name || null;
  }, [brands, previewData.brandId]);

  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            productId={productId}
            categories={categories}
            brands={brands}
            onSuccess={handleBasicInfoCreated}
            onValuesChange={handlePreviewChange}
          />
        );
      case 1:
        return (
          <AttributesStep
            productId={productId!}
            onSuccess={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <VariantsPricingStep
            productId={productId!}
            onSuccess={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            onPriceChange={setPriceDisplay}
          />
        );
      case 3:
        return (
          <MediaStep
            productId={productId!}
            onSuccess={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            onPrimaryImageChange={setPrimaryImageUrl}
          />
        );
      case 4:
        return (
          <InventoryReviewStep
            productId={productId!}
            onFinish={() => {
              draft.clearDraft();
              router.push("/products");
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden h-full">
      <PageHeader
        level={2}
        className="shrink-0"
        breadcrumbs={
          <Inline gap={1} align="center" className="text-xs">
            <Link
              href="/products"
              onClick={() => draft.clearDraft()}
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="truncate">Create Product</span>
          </Inline>
        }
        title="Create Product"
        description="Fill in the details to add a new product to your catalogue."
      />

      {/* Stepper */}
      <div className="shrink-0 rounded-lg border bg-card px-6 py-4">
        <Stepper
          steps={WIZARD_STEPS}
          current={currentStep}
          variant="progress"
          orientation="horizontal"
          showBadge={false}
        />
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden rounded-lg">
        {/* Left: scrollable form step */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {renderStep()}
        </div>

        {/* Right: collapsible preview panel */}
        <Panel
          placement="right"
          variant="outline"
          collapsible
          defaultCollapsed={false}
          defaultSize={400}
          minSize={320}
          maxSize={480}
          collapsedSize={40}
          sectioned
        >
          <PanelHeader divider>
            <PanelTitle>Live Preview</PanelTitle>
          </PanelHeader>
          <PanelBody className="overflow-y-auto">
            <ProductPreviewCard
              data={previewData}
              categories={categories}
              brandName={brandName}
              priceDisplay={priceDisplay}
              primaryImageUrl={primaryImageUrl}
            />
          </PanelBody>
        </Panel>
      </div>

      {/* Footer navigation actions */}
      <div className="shrink-0 flex items-center justify-between border-t bg-background px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            draft.clearDraft();
            router.push("/products");
          }}
        >
          Cancel
        </Button>

        <Inline gap={2}>
          {currentStep > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              ← Back
            </Button>
          )}

          {currentStep === 0 && (
            <Button type="submit" form="basic-info-step-form" size="sm">
              Save &amp; Continue →
            </Button>
          )}

          {currentStep === 1 && (
            <Button type="submit" form="attributes-step-form" size="sm">
              Save &amp; Continue →
            </Button>
          )}

          {currentStep === 2 && (
            <Button type="submit" form="variants-step-form" size="sm">
              Save &amp; Continue →
            </Button>
          )}

          {currentStep === 3 && (
            <Button type="submit" form="media-step-form" size="sm">
              Save &amp; Continue →
            </Button>
          )}

          {isLastStep && productId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                draft.clearDraft();
                router.push(`/products/${productId}`);
              }}
            >
              Open in Workspace →
            </Button>
          )}
        </Inline>
      </div>
    </div>
  );
};
