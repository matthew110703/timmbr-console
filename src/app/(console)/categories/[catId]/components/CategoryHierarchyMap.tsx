"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@timmbr/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@timmbr/ui";
import type { Category, CategoryWithParent } from "../../types";
import { strings } from "../../strings";

export interface CategoryHierarchyMapProps {
  category: CategoryWithParent;
  allCategories: Category[];
}

interface HierarchyTreeNode {
  id: string;
  name: string;
  slug: string;
  isCurrent: boolean;
  children: HierarchyTreeNode[];
}

const TreeItem: React.FC<{
  node: HierarchyTreeNode;
  isLast: boolean;
  isRoot?: boolean;
}> = ({ node, isLast, isRoot = false }) => {
  return (
    <div className={cn("relative", !isRoot && "pl-6")}>
      {/* Minimal Tree Connector Lines */}
      {!isRoot && (
        <>
          {/* Vertical branch from above to node center */}
          <span
            className="absolute left-0 top-0 w-px bg-border pointer-events-none"
            style={{ height: "16px" }}
          />
          {/* Vertical continuation to next sibling */}
          {!isLast && (
            <span className="absolute left-0 top-[16px] bottom-0 w-px bg-border pointer-events-none" />
          )}
          {/* Horizontal elbow to node text */}
          <span
            className="absolute left-0 top-[16px] h-px bg-border pointer-events-none"
            style={{ width: "16px" }}
          />
        </>
      )}

      {/* Node Row */}
      <div className="flex items-center gap-2 py-1 min-h-[32px]">
        <Link
          href={`/categories/${node.id}`}
          className={cn(
            "text-sm tracking-tight transition-colors truncate",
            node.isCurrent
              ? "font-semibold text-primary underline underline-offset-4"
              : "text-foreground hover:text-primary hover:underline",
          )}
        >
          {node.name}
        </Link>
        {node.isCurrent && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded select-none shrink-0">
            Current
          </span>
        )}
      </div>

      {/* Nested Children */}
      {node.children.length > 0 && (
        <div className="relative">
          {node.children.map((child, idx) => (
            <TreeItem
              key={child.id}
              node={child}
              isLast={idx === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryHierarchyMap: React.FC<CategoryHierarchyMapProps> = ({
  category,
  allCategories,
}) => {
  // Build the hierarchical tree containing the current category
  const treeRoot = useMemo<HierarchyTreeNode | null>(() => {
    if (!allCategories || allCategories.length === 0) return null;

    const catMap = new Map<string, Category>(
      allCategories.map((c) => [c.id, c]),
    );
    const current = catMap.get(category.id) || category;

    // 1. Traverse up to find root category
    let root = current;
    const visited = new Set<string>();
    while (
      root.parentId &&
      catMap.has(root.parentId) &&
      !visited.has(root.parentId)
    ) {
      visited.add(root.id);
      root = catMap.get(root.parentId)!;
    }

    // 2. Recursively build tree starting from root
    const buildNode = (cat: Category): HierarchyTreeNode => {
      const children = allCategories.filter((c) => c.parentId === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isCurrent: cat.id === category.id,
        children: children.map(buildNode),
      };
    };

    return buildNode(root);
  }, [category, allCategories]);

  return (
    <Card
      variant="outline"
      className="border-border/80 shadow-xs overflow-hidden flex flex-col h-full"
    >
      <CardHeader className="border-b border-border bg-card/50 py-3.5 px-5">
        <CardTitle className="text-sm font-semibold font-sans text-foreground">
          {strings.detail.hierarchy.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-start">
        {treeRoot ? (
          <div className="font-sans">
            <TreeItem node={treeRoot} isLast={true} isRoot={true} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {strings.detail.hierarchy.noSubcategories}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
