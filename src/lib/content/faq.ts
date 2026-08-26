import "server-only";
import { db } from "@/lib/db";
import type { FaqCategory } from "@/data/faq";

export async function getAllFaqs(): Promise<FaqCategory[]> {
  const rows = await db.faqCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return rows.map((c) => ({
    category: c.category,
    items: c.items.map((i) => ({ question: i.question, answer: i.answer })),
  }));
}
