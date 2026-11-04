export const strings = {
  metadata: {
    title: "Brands | Timmbr Console",
    description: "Manage brand identities, manufacturers, and vendor labels",
    detailTitle: (name: string) => `${name} | Brand Details | Timmbr Console`,
  },
  header: {
    title: "Brands",
    subtitle:
      "Manage brand identities, manufacturers, and vendor partnerships.",
    newBrand: "New Brand",
  },
  tabs: {
    all: "All",
    active: "Active",
    inactive: "Inactive",
    archived: "Archived",
  },
  toolbar: {
    searchPlaceholder: "Search brands by name...",
    clearFilters: "Clear Filters",
  },
  card: {
    noDescription: "No description provided.",
    createdPrefix: "Created",
    status: {
      active: "Active",
      inactive: "Inactive",
      archived: "Archived",
    },
  },
  empty: {
    title: "No brands found",
    description:
      "Start by adding your first brand to organise products by manufacturer or label.",
    filteredDescription: "No brands match the selected status filter.",
    action: "Create First Brand",
  },
  error: {
    title: "Failed to load brands",
    description:
      "An unexpected error occurred while fetching brands from the server.",
  },
  detail: {
    backToBrands: "Back to Brands",
    editBrand: "Edit",
    saveChanges: "Save Changes",
    savingChanges: "Saving Changes...",
    cancelEdit: "Cancel",
    deleteBrand: "Delete Brand",
    deleteTooltip: "Delete this brand",
    overviewTitle: "Brand Overview",
    overviewSubtitle: "Brand identity details and system metadata",
    fields: {
      name: "Brand Name",
      slug: "URL Slug",
      status: "Status",
      description: "Description",
      logo: "Brand Logo",
      brandId: "Brand ID",
      createdAt: "Created At",
      updatedAt: "Last Updated",
    },
    deleteModal: {
      title: "Delete Brand",
      description:
        "Are you sure you want to delete this brand? This action cannot be undone.",
      confirmButton: "Delete Permanently",
      cancelButton: "Cancel",
      deleting: "Deleting...",
    },
  },
} as const;
