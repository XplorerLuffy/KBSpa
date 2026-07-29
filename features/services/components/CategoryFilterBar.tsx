import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/domain";

export function CategoryFilterBar({
  categories,
  active,
  basePath = "/services",
  paramName = "category",
}: {
  categories: Pick<Category, "id" | "name" | "slug">[];
  active: string;
  basePath?: string;
  paramName?: string;
}) {
  const options = [{ id: "all", name: "All", slug: "all" }, ...categories];

  return (
    <nav aria-label="Filter by category" className="overflow-x-auto pb-2">
      <ul className="flex w-max gap-2">
        {options.map((option) => {
          const isActive = option.slug === active;
          const href =
            option.slug === "all"
              ? basePath
              : `${basePath}?${paramName}=${option.slug}`;

          return (
            <li key={option.id}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-gold-500 bg-gold-500 text-charcoal-900"
                    : "border-border bg-card text-muted-foreground hover:border-olive-300 hover:bg-olive-50 hover:text-olive-800 dark:hover:bg-olive-900/20 dark:hover:text-olive-200",
                )}
              >
                {option.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
