// Package IDs double as the public URL segment (/packages/goa-beach-bliss),
// which is why they were a hand-typed field: someone had to decide the URL.
// Staff now type only the title and the id is derived from it, so the two can
// never disagree and nobody can accidentally publish a package at an id like
// "Goa Package FINAL 2".

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      // Strip the accent marks NFKD just separated out, so "Curaçao" becomes
      // "curacao" rather than losing the letter entirely.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      // Matches the 120-char cap on Package.id in the validation schema.
      .slice(0, 120)
      // A trailing hyphen can reappear after slicing mid-word.
      .replace(/-+$/g, "")
  );
}

/**
 * Appends -2, -3, ... until the slug is free. `isTaken` is injected rather
 * than querying here so this stays a pure function the unit tests can drive
 * without a database.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const root = base || "package";
  if (!(await isTaken(root))) return root;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${root.slice(0, 116)}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  // 998 packages sharing one title is not a real scenario; falling back to a
  // timestamp beats throwing and losing the staff member's filled-in form.
  return `${root.slice(0, 106)}-${Date.now().toString(36)}`;
}
