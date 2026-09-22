import {
  BedDouble,
  Bus,
  Cake,
  Camera,
  Car,
  CircleCheck,
  FileCheck,
  Flame,
  Flower2,
  Martini,
  Plane,
  Plus,
  TrainFront,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

// Inclusion icons can't be looked up dynamically from lucide-react - that
// would pull all ~1,767 icons into the client bundle - so the set an admin
// can choose from is an explicit allow-list. Unlike the per-component `icons`
// records elsewhere in this codebase (Categories.tsx, WhyChooseUs.tsx, each
// with its own copy and a comment asking the next person to keep them in
// sync), this is the single registry that both the admin picker and every
// renderer read, so the two cannot drift apart.
export const inclusionIcons: Record<string, LucideIcon> = {
  BedDouble,
  Plane,
  Car,
  Camera,
  TrainFront,
  UtensilsCrossed,
  Flame,
  Flower2,
  Cake,
  Martini,
  FileCheck,
  Bus,
  Plus,
};

export const inclusionIconNames = Object.keys(inclusionIcons);

/**
 * Never returns undefined. Inclusions are admin-editable now, so a row can
 * legitimately carry no icon (or one named before an icon was removed from
 * the allow-list above); rendering `undefined` as a component is what would
 * otherwise take down every public package page the moment someone adds an
 * inclusion without picking an icon.
 */
export function resolveInclusionIcon(name: string | null | undefined): LucideIcon {
  if (!name) return CircleCheck;
  return inclusionIcons[name] ?? CircleCheck;
}
