export const strings = {
  metadata: {
    title: "Attributes — Timmbr Console",
    description:
      "Manage global attribute templates and definitions for catalog products and variants.",
  },
  header: {
    title: "Attribute Definitions",
    subtitle:
      "Global attribute templates and options used across products and variants.",
    newAttribute: "New Attribute",
  },
  toolbar: {
    searchPlaceholder: "Search attributes by name or key...",
    scopeFilterAll: "All Scopes",
    scopeProduct: "Product",
    scopeVariant: "Variant",
    typeFilterAll: "All Types",
    clearFilters: "Clear Filters",
    selectedCount: (n: number) =>
      `${n} ${n === 1 ? "attribute" : "attributes"} selected`,
    deselectAll: "Deselect all",
    deleteSelected: "Delete selected",
  },
  table: {
    selectCol: "Select",
    name: "Name",
    key: "Key",
    type: "Type",
    scope: "Scope",
    filterable: "Filterable",
    displayType: "Filter Display",
    optionsCount: "Options",
    actions: "Actions",
    empty: "No attributes found. Create your first global attribute template.",
    emptyFiltered: "No attributes matched the filter criteria.",
    emptyTitle: "No Attributes Yet",
    yes: "Yes",
    no: "No",
  },
  dialog: {
    createTitle: "Create Attribute Definition",
    createSubtitle: "Define a reusable attribute template for catalog items.",
    editTitle: "Edit Attribute Definition",
    editSubtitle:
      "Update configuration and options for this attribute template.",
    nameLabel: "Attribute Name",
    namePlaceholder: "e.g. Primary Material, Screen Size, Color",
    keyLabel: "Machine Key (Slug)",
    keyPlaceholder: "e.g. material, screen-size, color",
    keyHelper:
      "Lowercase letters, digits and hyphens. Immutable once assigned.",
    typeLabel: "Attribute Type",
    scopeLabel: "Target Scope",
    unitLabel: "Unit of Measurement (Optional)",
    unitPlaceholder: "e.g. cm, kg, GB, inch",
    unitHelper: "Appended to numeric values (e.g. 150 cm, 2.5 kg).",
    isFilterableLabel: "Storefront Filterable",
    isFilterableDescription:
      "Allow storefront shoppers to filter products by this attribute.",
    displayTypeLabel: "Filter Display Style",
    filterOrderLabel: "Filter Sort Order",
    cancel: "Cancel",
    save: "Save Changes",
    create: "Create Attribute",
    creating: "Creating...",
    saving: "Saving...",
    createFailedTitle: "Creation Failed",
    updateFailedTitle: "Update Failed",
    noLongerExists: "This attribute no longer exists. The list will refresh.",
  },
  definitionMeta: {
    typeLabel: "Type",
    scopeLabel: "Scope",
    keyLabel: "Key",
  },
  options: {
    title: "Allowed Options",
    addSectionTitle: "Add Allowed Option",
    description: "Allowed discrete values for LIST or STRING type attributes.",
    addOption: "Add Option",
    labelLabel: "Option Label",
    labelHeader: "Option Label",
    slugLabel: "Slug",
    slugHeader: "Option Slug",
    slugHelper: "URL-safe key (auto-generated from label)",
    swatchLabel: "Swatch Colour (Hex)",
    swatchHelper: "Optional — used with SWATCH display type",
    hexHeader: "Swatch Colour",
    orderHeader: "Sort Order",
    noOptions:
      "No options defined yet. Add options so products can select from preset values.",
    loadingOptions: "Loading options...",
    helperFilterable:
      "These options appear as filter choices in the storefront.",
    helperNonFilterable:
      "Options define the valid values for this attribute in product data.",
    warningNoOptions:
      "Add at least one option to make this filter active in the storefront.",
    optionsCount: (n: number) => `${n} ${n === 1 ? "Option" : "Options"}`,
    labelPlaceholder: "e.g. Teak, Navy Blue, XL",
    slugPlaceholder: "e.g. teak, navy-blue, xl",
    hexPlaceholder: "#5C3A21",
    saveOption: "Save",
    deleteConfirm: "Remove option?",
    optionsErrorTitle: "Options Error",
  },
  delete: {
    title: "Delete Attribute Definition",
    description: (name: string) =>
      `Are you sure you want to delete the attribute definition "${name}"? This action cannot be undone and may affect products currently referencing it.`,
    confirm: "Delete Attribute",
    cancel: "Cancel",
    deleting: "Deleting...",
  },
  bulkDelete: {
    title: (count: number) =>
      `Delete ${count} Attribute${count !== 1 ? "s" : ""}`,
    description: (count: number) =>
      `Are you sure you want to delete ${count} selected attribute${count !== 1 ? "s" : ""}? Attributes currently in use by products cannot be deleted.`,
    confirm: "Delete All",
    deleting: "Deleting...",
    successToast: (succeeded: number, total: number) =>
      succeeded === total
        ? `${succeeded} attribute${succeeded !== 1 ? "s" : ""} deleted.`
        : `${succeeded} of ${total} deleted. ${total - succeeded} could not be deleted (in use by products).`,
  },
  toasts: {
    createSuccess: "Attribute definition created successfully.",
    updateSuccess: "Attribute definition updated successfully.",
    deleteSuccess: "Attribute definition deleted successfully.",
    optionCreateSuccess: "Option added successfully.",
    optionUpdateSuccess: "Option updated successfully.",
    optionDeleteSuccess: "Option removed successfully.",
    error: "Operation failed. Please try again.",
  },
  permissions: {
    createAttributeRequired: "You do not have permission to create attributes.",
    editAttributeRequired: "You do not have permission to edit attributes.",
    deleteAttributeRequired: "You do not have permission to delete attributes.",
  },
};
