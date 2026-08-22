import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({
  items,
  light = false,
}: {
  items: BreadcrumbItem[];
  light?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex min-w-0 items-center gap-1.5 text-xs sm:text-sm ${
        light ? "text-white" : "text-ink-900"
      }`}
    >
      <Link
        href="/"
        aria-label="Home"
        className={`flex shrink-0 items-center transition ${
          light ? "hover:text-white" : "hover:text-brand-600"
        }`}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span
            key={item.label}
            className={`flex min-w-0 items-center gap-1.5 ${isLast ? "flex-1" : "shrink-0"}`}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`shrink-0 transition ${light ? "hover:text-white" : "hover:text-brand-600"}`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`min-w-0 truncate font-semibold ${light ? "text-white" : "text-ink-700"}`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
