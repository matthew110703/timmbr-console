"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@timmbr/ui";
import { generateSlug } from "@/lib/utils/slug";
import { attributeApi } from "../api";
import { strings } from "../strings";
import type { AttributeOption, CreateAttributeOptionInput } from "../types";

export function useAttributeOptions(
  definitionId: string | null,
  open: boolean,
  shouldLoad: boolean,
  displayType: string,
  onSuccess: (() => void) | undefined,
) {
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionSlug, setNewOptionSlug] = useState("");
  const [newOptionSwatch, setNewOptionSwatch] = useState("");
  const [newOptionOrder, setNewOptionOrder] = useState(0);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [optionError, setOptionError] = useState<string | null>(null);

  const loadOptions = useCallback(async (id: string) => {
    setIsLoadingOptions(true);
    setOptionError(null);
    try {
      const data = await attributeApi.getOptions(id);
      setOptions(data);
    } catch {
      setOptions([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (definitionId && open && shouldLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadOptions(definitionId);
    } else {
      setOptions([]);
    }
  }, [definitionId, open, shouldLoad, loadOptions]);

  // Clear swatch input when display type changes away from SWATCH
  useEffect(() => {
    if (displayType !== "SWATCH") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewOptionSwatch("");
    }
  }, [displayType]);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionLabel.trim() || !definitionId) return;

    setIsAddingOption(true);
    setOptionError(null);

    try {
      const slug = newOptionSlug.trim() || generateSlug(newOptionLabel.trim());
      const payload: CreateAttributeOptionInput = {
        label: newOptionLabel.trim(),
        slug,
        swatchHex: newOptionSwatch.trim() ? newOptionSwatch.trim() : null,
        sortOrder: Number(newOptionOrder) || 0,
      };

      await attributeApi.createOption(definitionId, payload);
      toast.success(strings.toasts.optionCreateSuccess);
      setNewOptionLabel("");
      setNewOptionSlug("");
      setNewOptionSwatch("");
      setNewOptionOrder(options.length + 1);
      await loadOptions(definitionId);
      onSuccess?.();
    } catch (err: unknown) {
      setOptionError(
        err instanceof Error ? err.message : "Failed to add option.",
      );
    } finally {
      setIsAddingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!definitionId) return;
    try {
      await attributeApi.deleteOption(definitionId, optionId);
      toast.success(strings.toasts.optionDeleteSuccess);
      await loadOptions(definitionId);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove option.",
      );
    }
  };

  return {
    options,
    isLoadingOptions,
    optionError,
    newOptionLabel,
    setNewOptionLabel,
    newOptionSlug,
    setNewOptionSlug,
    newOptionSwatch,
    setNewOptionSwatch,
    newOptionOrder,
    setNewOptionOrder,
    isAddingOption,
    handleAddOption,
    handleDeleteOption,
  };
}
