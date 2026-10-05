"use client";

import React, { useMemo, useState } from "react";
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
  Switch,
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
  Layers,
  Clock,
  Tag,
  Hash,
} from "lucide-react";
import { PageHeader } from "@/components";
import { mediaApi } from "@/lib/api";
import { categoryApi } from "../../api";
import { revalidateCategory } from "../../actions";
import { strings } from "../../strings";
import type { Category, CategoryWithParent } from "../../types";
import { CategoryHierarchyMap } from "./CategoryHierarchyMap";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

export interface CategoryDetailViewProps {
  initialCategory: CategoryWithParent;
  allCategories: Category[];
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  general?: string;
}

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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  initialCategory,
  allCategories,
}) => {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryWithParent>(initialCategory);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<FormState>({
    name: initialCategory.name,
    slug: initialCategory.slug,
    description: initialCategory.description || "",
    parentId: initialCategory.parentId,
    logoUrl: initialCategory.logoUrl,
    isActive: initialCategory.status === "ACTIVE",
  });
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Filter out current category from parent candidates to prevent cyclic loops
  const parentCategoryOptions = useMemo(() => {
    const rootOption = [
      { value: "none", label: strings.detail.fields.rootCategory },
    ];
    const candidateCategories = allCategories
      .filter((cat) => cat.id !== category.id)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
    return [...rootOption, ...candidateCategories];
  }, [allCategories, category.id]);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStartEditing = () => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId,
      logoUrl: category.logoUrl,
      isActive: category.status === "ACTIVE",
    });
    setErrors({});
    setIsSlugManuallyEdited(false);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: newName,
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(newName),
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined, general: undefined }));
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
    if (errors.description) {
      setErrors((prev) => ({
        ...prev,
        description: undefined,
        general: undefined,
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    const result = await mediaApi.uploadMedia(file, "categories");
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
      newErrors.name = "Category name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (form.slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(form.slug.trim())) {
        newErrors.slug =
          "Slug must only contain lowercase alphanumeric characters and single hyphens";
      }
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
      const updated = await categoryApi.updateCategory(category.id, {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        parentId:
          form.parentId === "none" || !form.parentId ? null : form.parentId,
        logoUrl: form.logoUrl || null,
        status: form.isActive ? "ACTIVE" : "INACTIVE",
      });

      // Find parent category object if parentId changed
      const resolvedParent = updated.parentId
        ? (allCategories.find((c) => c.id === updated.parentId) ?? null)
        : null;

      const updatedWithParent: CategoryWithParent = {
        ...updated,
        parent: resolvedParent,
      };

      setCategory(updatedWithParent);
      await revalidateCategory(category.id);
      setIsEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update category. Please check your inputs and try again.";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChildren = allCategories.some((c) => c.parentId === category.id);

  return (
    <Stack gap={6}>
      {/* ── Top Bar with Breadcrumbs & Action Controls ── */}
      <PageHeader
        breadcrumbs={
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground transition-colors group"
          >
            <Icon
              icon={ArrowLeft}
              size="sm"
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>{strings.detail.backToCategories}</span>
          </Link>
        }
        title={category.name}
        badge={
          <Badge
            variant={category.status === "ACTIVE" ? "success" : "subtle"}
            size="sm"
            dot={category.status === "ACTIVE"}
          >
            {category.status}
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
                  {strings.detail.editCategory}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  aria-label={strings.detail.deleteTooltip}
                  title={strings.detail.deleteTooltip}
                  className="border-grey-300 hover:border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors shrink-0"
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

      {/* ── 2-Column Responsive Layout (Side by Side on Desktop) ── */}
      <div className="category-detail-layout">
        {/* ── Left Column: Details Overview OR Edit Form ── */}
        <div className="w-full min-w-0">
          {!isEditing ? (
            /* ── VIEW MODE ── */
            <Stack gap={5}>
              <Card
                variant="outline"
                className="border-grey-200/80 shadow-xs overflow-hidden bg-white"
              >
                <CardHeader className="border-b border-grey-100 bg-grey-50/50 pb-4">
                  <Inline justify="between" align="center">
                    <Stack gap={0.5}>
                      <CardTitle className="text-base font-bold font-sans">
                        {strings.detail.overviewTitle}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted">
                        {strings.detail.overviewSubtitle}
                      </CardDescription>
                    </Stack>
                  </Inline>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Category Image & Identity Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-grey-50/80 border border-grey-200/70">
                    <div className="size-20 rounded-xl bg-white border border-grey-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {category.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.logoUrl}
                          alt={category.name}
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
                      <Inline gap={2} align="center">
                        <Text
                          variant="body-1"
                          className="text-lg font-bold text-foreground truncate"
                        >
                          {category.name}
                        </Text>
                      </Inline>

                      {/* Copyable Slug */}
                      <Inline gap={2.5} align="center">
                        <span className="font-mono text-xs text-grey-700 bg-white px-2 py-0.5 rounded border border-grey-200">
                          /{category.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(category.slug, "slug")}
                          className="text-grey-400 hover:text-foreground text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy Slug"
                        >
                          <Icon icon={Copy} size="sm" className="size-3" />
                          <span className="text-[11px]">
                            {copiedField === "slug" ? "Copied!" : "Copy"}
                          </span>
                        </button>
                      </Inline>

                      {/* Parent Reference */}
                      <Inline
                        gap={2}
                        align="center"
                        className="text-xs text-muted mt-0.5"
                      >
                        <Icon
                          icon={Layers}
                          size="sm"
                          className="text-primary size-3.5 shrink-0"
                        />
                        {category.parent ? (
                          <span>
                            Parent:{" "}
                            <Link
                              href={`/categories/${category.parent.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {category.parent.name}
                            </Link>
                          </span>
                        ) : (
                          <span>{strings.detail.fields.noParent}</span>
                        )}
                      </Inline>
                    </Stack>
                  </div>

                  {/* Description Section */}
                  <Stack gap={1.5}>
                    <Text
                      variant="caption"
                      className="font-semibold text-grey-500 uppercase tracking-wider text-[11px]"
                    >
                      {strings.detail.fields.description}
                    </Text>
                    <Text
                      variant="body-2"
                      className="text-sm text-foreground/80 leading-relaxed font-normal"
                    >
                      {category.description || (
                        <span className="italic text-muted">
                          {strings.card.noDescription}
                        </span>
                      )}
                    </Text>
                  </Stack>

                  {/* Metadata & Audit Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-grey-100">
                    <div className="p-3 rounded-lg bg-grey-50 border border-grey-100 flex items-center gap-3">
                      <Center className="size-8 rounded-md bg-white border border-grey-200 text-grey-500 shrink-0">
                        <Icon icon={Calendar} size="sm" />
                      </Center>
                      <Stack gap={0} className="min-w-0">
                        <Text
                          variant="caption"
                          className="text-[11px] text-muted font-medium"
                        >
                          {strings.detail.fields.createdAt}
                        </Text>
                        <Text
                          variant="body-2"
                          className="text-xs font-medium text-foreground truncate"
                        >
                          {formatDate(category.createdAt)}
                        </Text>
                      </Stack>
                    </div>

                    <div className="p-3 rounded-lg bg-grey-50 border border-grey-100 flex items-center gap-3">
                      <Center className="size-8 rounded-md bg-white border border-grey-200 text-grey-500 shrink-0">
                        <Icon icon={Clock} size="sm" />
                      </Center>
                      <Stack gap={0} className="min-w-0">
                        <Text
                          variant="caption"
                          className="text-[11px] text-muted font-medium"
                        >
                          {strings.detail.fields.updatedAt}
                        </Text>
                        <Text
                          variant="body-2"
                          className="text-xs font-medium text-foreground truncate"
                        >
                          {formatDate(category.updatedAt)}
                        </Text>
                      </Stack>
                    </div>
                  </div>

                  {/* Full Category ID Footer */}
                  <Inline
                    justify="between"
                    align="center"
                    className="pt-2 text-xs text-muted border-t border-grey-100"
                  >
                    <Inline gap={2} align="center" className="min-w-0">
                      <Icon
                        icon={Hash}
                        size="sm"
                        className="text-grey-400 size-3 shrink-0"
                      />
                      <span className="text-[11px] text-muted uppercase font-semibold">
                        ID:
                      </span>
                      <span className="font-mono text-xs text-grey-600 truncate select-all">
                        {category.id}
                      </span>
                    </Inline>
                    <button
                      type="button"
                      onClick={() => handleCopy(category.id, "id")}
                      className="text-grey-500 hover:text-foreground text-xs inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      <Icon icon={Copy} size="sm" className="size-3" />
                      <span>{copiedField === "id" ? "Copied" : "Copy ID"}</span>
                    </button>
                  </Inline>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            /* ── EDIT MODE (FORM) ── */
            <Card
              variant="outline"
              className="border-primary/40 shadow-sm overflow-hidden bg-white"
            >
              <CardHeader className="border-b border-grey-100 bg-primary/5 pb-4">
                <Inline justify="between" align="center">
                  <Stack gap={0.5}>
                    <CardTitle className="text-base font-bold font-sans text-primary">
                      Edit Category Details
                    </CardTitle>
                    <CardDescription className="text-xs text-muted">
                      Update taxonomic attributes, slug, parent relationship,
                      and image.
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
                    {/* Category Name */}
                    <FormField
                      label="Category Name"
                      required
                      error={errors.name}
                      helperText="The display name of the category."
                    >
                      <Input
                        placeholder="e.g. Living Room Furniture"
                        value={form.name}
                        onChange={handleNameChange}
                        disabled={isSubmitting}
                        error={errors.name}
                        autoFocus
                      />
                    </FormField>

                    {/* Slug */}
                    <FormField
                      label="URL Slug"
                      error={errors.slug}
                      helperText="Unique URL identifier for this category."
                    >
                      <Input
                        placeholder="e.g. living-room-furniture"
                        value={form.slug}
                        onChange={handleSlugChange}
                        disabled={isSubmitting}
                        error={errors.slug}
                      />
                    </FormField>

                    {/* Parent Category */}
                    <FormField
                      label="Parent Category"
                      helperText="Assign a parent category to place within the taxonomic hierarchy."
                    >
                      <Select
                        placeholder="Select parent category (optional)"
                        options={parentCategoryOptions}
                        value={form.parentId ?? "none"}
                        onValueChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            parentId: val === "none" ? null : val,
                          }))
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>

                    {/* Description */}
                    <FormField
                      label="Description"
                      error={errors.description}
                      helperText="10-200 character summary for catalog organization."
                    >
                      <Textarea
                        placeholder="Briefly describe this category..."
                        value={form.description}
                        onChange={handleDescriptionChange}
                        disabled={isSubmitting}
                        rows={3}
                        error={errors.description}
                      />
                    </FormField>

                    {/* Image Upload and Active Status Switch */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-1">
                      <ImageUpload
                        label="Category Logo / Image"
                        value={form.logoUrl}
                        onUpload={handleImageUpload}
                        onRemove={handleImageRemove}
                        disabled={isSubmitting}
                        aspectRatio="square"
                        helperText="Upload a logo or thumbnail (PNG, JPG, or WEBP up to 5MB)."
                        className="w-auto shrink-0 max-w-xs"
                      />

                      <div className="flex-1 sm:max-w-xs">
                        <Switch
                          label="Active Status"
                          description="Make this category active and visible in the catalog."
                          checked={form.isActive}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, isActive: checked }))
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </Stack>

                  {/* Form Actions Footer */}
                  <div className="pt-5 border-t border-grey-100 flex items-center justify-end gap-3">
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
        </div>

        {/* ── Right Column: Category Map & Hierarchy Tree ── */}
        <div className="w-full min-w-0">
          <CategoryHierarchyMap
            category={category}
            allCategories={allCategories}
          />
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={category}
        hasChildren={hasChildren}
      />
    </Stack>
  );
};
