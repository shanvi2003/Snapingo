import "server-only";
import { db } from "@/lib/db";

export type ServiceCategoryContent = { icon: string; label: string; desc: string; image: string };
export type TrustLogoContent = { name: string; category: string; logo: string };
export type UspContent = { icon: string; title: string; desc: string };

export async function getServiceCategories(): Promise<ServiceCategoryContent[]> {
  const rows = await db.serviceCategory.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ icon: r.icon, label: r.label, desc: r.desc, image: r.image }));
}

export async function getTrustLogos(): Promise<TrustLogoContent[]> {
  const rows = await db.trustLogo.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ name: r.name, category: r.category, logo: r.logo }));
}

export async function getUsps(): Promise<UspContent[]> {
  const rows = await db.usp.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ icon: r.icon, title: r.title, desc: r.desc }));
}
