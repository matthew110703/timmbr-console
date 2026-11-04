"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  Text,
  Stack,
  Inline,
  Alert,
  Center,
  ImageUpload,
  Icon,
} from "@timmbr/ui";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  X,
  Copy,
  Calendar,
  Clock,
  Tag,
  Hash,
} from "lucide-react";
import { PageHeader } from "@/components";
import { mediaApi } from "@/lib/api";
import { brandApi } from "../../api";
import { revalidateBrand } from "../../actions";
import { strings } from "../../strings";
import type { Brand, BrandStatus } from "../../types";
import { DeleteBrandDialog } from "./DeleteBrandDialog";

export interface BrandDetailViewProps {
  initialBrand: Brand;
}

interface FormState {
  name: string;
  description: string;
  logoUrl: string | null;
  status: BrandStatus;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const STATUS_OPTIONS: { value: BrandStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

function getStatusBadgeVariant(
  status: BrandStatus,
): "success" | "subtle" | "outline" {
  if (status === "ACTIVE") return "success";
  if (status === "ARCHIVED") return "outline";
  return "subtle";
}

export const BrandDetailView: React.FC<BrandDetailViewProps> = ({
  initialBrand,
}) => {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand>(initialBrand);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: initialBrand.name,
    description: initialBrand.description || "",
    logoUrl: initialBrand.logoUrl,
    status: initialBrand.status,
  });
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStartEditing = () => {
    setForm({
      name: brand.name,
      description: brand.description || "",
      logoUrl: brand.logoUrl,
      status: brand.status,
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleImageUpload = async (file: File) => {
    const result = await mediaApi.uploadMedia(file, "brands");
    setUploadedKey(result.key);
    setForm((prev) => ({ ...prev, logoUrl: result.url }));
    return result.url;
  };

  const handleImageRemove = async () => {
    if (uploadedKey) {
      try {
        await mediaApi.deleteMedia(uploadedKey);
      } catch {
        // Ignore cleanup failure
      }
    }
    setUploadedKey(null);
    setForm((prev) => ({ ...prev, logoUrl: null }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Brand name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (form.description.trim()) {
      if (form.description.trim().length < 10) {
        newErrors.description =
          "Description must be at least 10 characters if provided";
      } else if (form.description.trim().length > 200) {
        newErrors.description = "Description cannot exceed 200 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const updated = await brandApi.updateBrand(brand.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        logoUrl: form.logoUrl || null,
        status: form.status,
      });

      setBrand(updated);
      await revalidateBrand(brand.id);
      setIsEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update brand. Please check your inputs and try again.";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap={6}>
      {/* ── Top Bar ── */}
      <PageHeader
        breadcrumbs={
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Icon
              icon={ArrowLeft}
              size="sm"
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>{strings.detail.backToBrands}</span>
          </Link>
        }
        title={brand.name}
        badge={
          <Badge
            variant={getStatusBadgeVariant(brand.status)}
            size="sm"
            dot={brand.status === "ACTIVE"}
          >
            {brand.status}
          </Badge>
        }
        action={
          <Inline gap={3} align="center">
            {!isEditing ? (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={handleStartEditing}
                  className="gap-2.5"
                  leftIcon={<Icon icon={Pencil} size="sm" />}
                >
                  {strings.detail.editBrand}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  aria-label={strings.detail.deleteTooltip}
                  title={strings.detail.deleteTooltip}
                  className="border-border hover:border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                >
                  <Icon icon={Trash2} size="md" className="text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleCancelEditing}
                  disabled={isSubmitting}
                  className="gap-2.5"
                  leftIcon={<Icon icon={X} size="sm" />}
                >
                  {strings.detail.cancelEdit}
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={handleSave}
                  loading={isSubmitting}
                  loadingText={strings.detail.savingChanges}
                  className="gap-2.5"
                  leftIcon={<Icon icon={Check} size="sm" />}
                >
                  {strings.detail.saveChanges}
                </Button>
              </>
            )}
          </Inline>
        }
      />

      {/* ── Details Card ── */}
      {!isEditing ? (
        /* ── VIEW MODE ── */
        <Card
          variant="outline"
          className="border-border/80 shadow-xs overflow-hidden"
        >
          <CardHeader className="border-b border-border bg-card/50 pb-4">
            <Stack gap={0.5}>
              <CardTitle className="text-base font-bold font-sans">
                {strings.detail.overviewTitle}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {strings.detail.overviewSubtitle}
              </CardDescription>
            </Stack>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Logo & Identity Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-card/80 border border-border/70">
              <div className="size-20 rounded-xl bg-card border border-border overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Center className="size-full text-primary">
                    <Icon
                      icon={Tag}
                      size="lg"
                      className="text-primary size-7"
                    />
                  </Center>
                )}
              </div>

              <Stack gap={1.5} className="min-w-0 flex-1">
                <Text
                  variant="body-1"
                  className="text-lg font-bold text-foreground truncate"
                >
                  {brand.name}
                </Text>

                <Inline gap={2.5} align="center">
                  <span className="font-mono text-xs text-foreground/70 bg-card px-2 py-0.5 rounded border border-border">
                    /{brand.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(brand.slug, "slug")}
                    className="text-muted-foreground/70 hover:text-foreground text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy Slug"
                  >
                    <Icon icon={Copy} size="sm" className="size-3" />
                    <span className="text-[11px]">
                      {copiedField === "slug" ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </Inline>
              </Stack>
            </div>

            {/* Description */}
            <Stack gap={1.5}>
              <Text
                variant="caption"
                className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]"
              >
                {strings.detail.fields.description}
              </Text>
              <Text
                variant="body-2"
                className="text-sm text-foreground/80 leading-relaxed font-normal"
              >
                {brand.description || (
                  <span className="italic text-muted-foreground">
                    {strings.card.noDescription}
                  </span>
                )}
              </Text>
            </Stack>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
                <Center className="size-8 rounded-md bg-background border border-border text-muted-foreground shrink-0">
                  <Icon icon={Calendar} size="sm" />
                </Center>
                <Stack gap={0} className="min-w-0">
                  <Text
                    variant="caption"
                    className="text-[11px] text-muted-foreground font-medium"
                  >
                    {strings.detail.fields.createdAt}
                  </Text>
                  <Text
                    variant="body-2"
                    className="text-xs font-medium text-foreground truncate"
                  >
                    {formatDate(brand.createdAt)}
                  </Text>
                </Stack>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
                <Center className="size-8 rounded-md bg-background border border-border text-muted-foreground shrink-0">
                  <Icon icon={Clock} size="sm" />
                </Center>
                <Stack gap={0} className="min-w-0">
                  <Text
                    variant="caption"
                    className="text-[11px] text-muted-foreground font-medium"
                  >
                    {strings.detail.fields.updatedAt}
                  </Text>
                  <Text
                    variant="body-2"
                    className="text-xs font-medium text-foreground truncate"
                  >
                    {formatDate(brand.updatedAt)}
                  </Text>
                </Stack>
              </div>
            </div>

            {/* ID Footer */}
            <Inline
              justify="between"
              align="center"
              className="pt-2 text-xs text-muted-foreground border-t border-border"
            >
              <Inline gap={2} align="center" className="min-w-0">
                <Icon
                  icon={Hash}
                  size="sm"
                  className="text-muted-foreground/70 size-3 shrink-0"
                />
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  ID:
                </span>
                <span className="font-mono text-xs text-muted-foreground truncate select-all">
                  {brand.id}
                </span>
              </Inline>
              <button
                type="button"
                onClick={() => handleCopy(brand.id, "id")}
                className="text-muted-foreground hover:text-foreground text-xs inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ml-2"
              >
                <Icon icon={Copy} size="sm" className="size-3" />
                <span>{copiedField === "id" ? "Copied" : "Copy ID"}</span>
              </button>
            </Inline>
          </CardContent>
        </Card>
      ) : (
        /* ── EDIT MODE ── */
        <Card
          variant="outline"
          className="border-primary/40 shadow-sm overflow-hidden"
        >
          <CardHeader className="border-b border-border bg-primary/5 pb-4">
            <Inline justify="between" align="center">
              <Stack gap={0.5}>
                <CardTitle className="text-base font-bold font-sans text-primary">
                  Edit Brand Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Update brand identity, logo, and visibility status.
                </CardDescription>
              </Stack>
              <Badge variant="primary" size="sm">
                Editing
              </Badge>
            </Inline>
          </CardHeader>

          <form onSubmit={handleSave}>
            <CardContent className="p-6 space-y-5">
              {errors.general && (
                <Alert variant="destructive" title="Update Failed">
                  {errors.general}
                </Alert>
              )}

              <Stack gap={4}>
                <FormField
                  label="Brand Name"
                  required
                  error={errors.name}
                  helperText="The official brand name."
                >
                  <Input
                    placeholder="e.g. Ashley Furniture"
                    value={form.name}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    disabled={isSubmitting}
                    error={errors.name}
                    autoFocus
                  />
                </FormField>

                {/* Slug + Status — side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="URL Slug"
                    helperText="Auto-generated. Cannot be changed."
                  >
                    <div className="flex items-center px-3 py-2 rounded-md bg-card border border-border text-sm font-mono text-muted-foreground select-all h-10">
                      /{brand.slug}
                    </div>
                  </FormField>

                  <FormField
                    label="Status"
                    helperText="Controls catalog visibility."
                  >
                    <Select
                      options={STATUS_OPTIONS}
                      value={form.status}
                      onValueChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          status: val as BrandStatus,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Description"
                  error={errors.description}
                  helperText="10-200 character summary of the brand."
                >
                  <Textarea
                    placeholder="Briefly describe this brand..."
                    value={form.description}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                      if (errors.description)
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }));
                    }}
                    disabled={isSubmitting}
                    rows={3}
                    error={errors.description}
                  />
                </FormField>

                <ImageUpload
                  label="Brand Logo"
                  value={form.logoUrl}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  disabled={isSubmitting}
                  aspectRatio="square"
                  helperText="Upload a brand logo (PNG, JPG, or WEBP up to 5MB)."
                  className="w-auto shrink-0 max-w-xs"
                />
              </Stack>

              <div className="pt-5 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditing}
                  disabled={isSubmitting}
                  className="gap-2.5"
                  leftIcon={<Icon icon={X} size="sm" />}
                >
                  {strings.detail.cancelEdit}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isSubmitting}
                  loadingText={strings.detail.savingChanges}
                  className="gap-2.5"
                  leftIcon={<Icon icon={Check} size="sm" />}
                >
                  {strings.detail.saveChanges}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <DeleteBrandDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        brand={brand}
      />
    </Stack>
  );
};
