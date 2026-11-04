/**
 * Product `description` must be a string that passes class-validator `@IsJSON()` on timmbr-core.
 * We store a small JSON document for plain-text editor content.
 */
export type ProductDescriptionDocument = {
  type: "plain";
  content: string;
};

export function encodeProductDescriptionForApi(
  plainText: string | undefined | null,
): string | undefined {
  const trimmed = plainText?.trim();
  if (!trimmed) return undefined;

  // Already valid JSON (e.g. pasted structured content) — normalize and re-stringify.
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed !== null && typeof parsed === "object") {
      return JSON.stringify(parsed);
    }
    if (typeof parsed === "string") {
      return JSON.stringify({ type: "plain", content: parsed });
    }
  } catch {
    /* treat as plain text */
  }

  const doc: ProductDescriptionDocument = { type: "plain", content: trimmed };
  return JSON.stringify(doc);
}

export function decodeProductDescriptionForForm(
  stored: string | null | undefined,
): string {
  if (!stored) return "";

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed === "string") return parsed;
    if (
      parsed &&
      typeof parsed === "object" &&
      "content" in parsed &&
      typeof (parsed as ProductDescriptionDocument).content === "string"
    ) {
      return (parsed as ProductDescriptionDocument).content;
    }
    if (parsed && typeof parsed === "object") {
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    /* legacy plain text in DB (seed / pre-validation rows) */
  }

  return stored;
}
