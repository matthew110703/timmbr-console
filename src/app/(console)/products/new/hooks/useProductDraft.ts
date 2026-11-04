"use client";

import { useCallback } from "react";

const DRAFT_KEY = "timmbr_product_draft_id";

export function useProductDraft() {
  const getDraftId = useCallback((): string | null => {
    try {
      return typeof window !== "undefined"
        ? sessionStorage.getItem(DRAFT_KEY)
        : null;
    } catch {
      return null;
    }
  }, []);

  const setDraftId = useCallback((id: string): void => {
    try {
      sessionStorage.setItem(DRAFT_KEY, id);
    } catch {
      // storage disabled or private mode — continue without persistence
    }
  }, []);

  const clearDraft = useCallback((): void => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { getDraftId, setDraftId, clearDraft };
}
