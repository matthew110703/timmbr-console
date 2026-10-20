"use server";

import { updateTag, revalidatePath } from "next/cache";

/** Immediately invalidate all cache entries associated with the given tag. */
export async function revalidateByTag(tag: string) {
  updateTag(tag);
}

export async function revalidateByPath(path: string, type?: "layout" | "page") {
  revalidatePath(path, type);
}
