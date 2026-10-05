import * as React from "react";

export interface CategoriesLayoutProps {
  children: React.ReactNode;
}

/**
 * Module-level layout for Categories.
 * Provides unified layout structure for all category routes.
 */
export default function CategoriesLayout({ children }: CategoriesLayoutProps) {
  return <div className="w-full">{children}</div>;
}
