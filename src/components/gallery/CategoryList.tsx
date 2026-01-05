"use client";

import { cn } from "@/lib/utils";
import { DOCUMENT_CATEGORIES } from "@/types";
import { useQueryState } from "nuqs";

export function CategoryList() {
  const [category, setCategory] = useQueryState("category");

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      <button
        onClick={() => setCategory(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
          !category
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80"
        )}
      >
        All resources
      </button>
      {DOCUMENT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            category === cat
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
