"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button, Inline } from "@timmbr/ui";
import { Search, X } from "lucide-react";
import { useDebounce } from "@timmbr/hooks";
import { strings } from "../strings";

export interface BrandSearchToolbarProps {
  initialSearch?: string;
}

export const BrandSearchToolbar: React.FC<BrandSearchToolbarProps> = ({
  initialSearch = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const currentParam = searchParams.get("search") || "";
    if (debouncedSearch.trim() === currentParam.trim()) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/brands?${qs}` : "/brands");
    });
  }, [debouncedSearch, router, searchParams]);

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/brands?${qs}` : "/brands");
    });
  };

  return (
    <Inline gap={3} align="center" className="w-full max-w-md">
      <div className="relative flex-1">
        <Input
          placeholder={strings.toolbar.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftAdornment={<Search className="size-4 text-muted-foreground" />}
          className="pr-8"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {searchTerm && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          {strings.toolbar.clearFilters}
        </Button>
      )}
    </Inline>
  );
};
