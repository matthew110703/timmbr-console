export const strings = {
  metadata: {
    title: "Categories | Timmbr Console",
    description: "Organize product categories and taxonomic hierarchy",
    detailTitle: (name: string) =>
      `${name} | Category Details | Timmbr Console`,
  },
  header: {
    title: "Categories",
    subtitle: "Organize products into hierarchical categories and collections.",
    newCategory: "New Category",
    refresh: "Refresh",
  },
  card: {
    noDescription: "No description provided.",
    createdPrefix: "Created",
    viewDetails: "View Details",
    status: {
      active: "Active",
      inactive: "Inactive",
      draft: "Draft",
      archived: "Archived",
    },
  },
  empty: {
    title: "No categories found",
    description:
      "Start building your taxonomy structure by creating your first category.",
    action: "Create First Category",
  },
  error: {
    title: "Failed to load categories",
    description:
      "An unexpected error occurred while fetching categories from the server.",
    retry: "Try again",
  },
  detail: {
    backToCategories: "Back to Categories",
    editCategory: "Edit",
    saveChanges: "Save Changes",
    savingChanges: "Saving Changes...",
    cancelEdit: "Cancel",
    deleteCategory: "Delete Category",
    deleteTooltip: "Delete this category",
    overviewTitle: "Category Overview",
    overviewSubtitle: "General taxonomic details and system metadata",
    fields: {
      name: "Category Name",
      slug: "URL Slug",
      status: "Status",
      description: "Description",
      parentId: "Parent Category",
      logo: "Logo / Image",
      categoryId: "Category ID",
      createdAt: "Created At",
      updatedAt: "Last Updated",
      rootCategory: "None (Root Category)",
      noParent: "Root Category (No Parent)",
    },
    hierarchy: {
      title: "Category Map & Hierarchy",
      subtitle:
        "Taxonomic tree position, ancestor chain, and nested subcategories",
      ancestorPath: "Hierarchy Path",
      currentCategory: "Current Category",
      subcategories: "Child Subcategories",
      noSubcategories: "No subcategories nested under this category.",
      rootNotice: "This is a top-level root category in your catalog taxonomy.",
      levelRoot: "Level 1 • Root Category",
      levelNested: "Nested Subcategory",
      viewChild: "View details",
    },
    deleteModal: {
      title: "Delete Category",
      description:
        "Are you sure you want to delete this category? This action cannot be undone.",
      hasChildrenWarning:
        "Warning: This category has child subcategories. Deleting this category may cascade or fail if children exist.",
      confirmButton: "Delete Permanently",
      cancelButton: "Cancel",
      deleting: "Deleting...",
    },
  },
} as const;
