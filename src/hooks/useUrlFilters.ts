"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Writes filter values into the URL so the Server Component page re-queries.
 *
 * The URL is the single source of truth for every admin list: it survives a
 * refresh, can be bookmarked or pasted to a colleague, and means the page
 * itself holds no filter state to fall out of sync. `replace` rather than
 * `push` keeps the back button meaningful - with push, clearing three filters
 * would take three back presses to undo.
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      // Any filter change resets paging - staying on page 4 of the previous
      // result set almost always lands on an empty table.
      params.delete("page");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { searchParams, pathname, setParam };
}
