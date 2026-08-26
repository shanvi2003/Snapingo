import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { addFaqCategoryAction, addFaqItemAction, deleteFaqItemAction } from "@/lib/actions/cms";

export default async function FaqManager() {
  const categories = await db.faqCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">FAQ</h1>
      <p className="mt-1 text-sm text-ink-500">Manage frequently asked questions shown on the site.</p>

      <div className="mt-6 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-base font-bold text-ink-900">{cat.category}</h2>

            <div className="mt-4 space-y-3">
              {cat.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-ink-50/60 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{item.question}</p>
                    <p className="mt-1 text-sm text-ink-700">{item.answer}</p>
                  </div>
                  <DeleteButton id={item.id} action={deleteFaqItemAction} confirmText="Delete this FAQ item?" />
                </div>
              ))}
              {cat.items.length === 0 && <p className="text-sm text-ink-500">No items yet.</p>}
            </div>

            <form action={addFaqItemAction} className="mt-4 space-y-2 border-t border-ink-100 pt-4">
              <input type="hidden" name="categoryId" value={cat.id} />
              <input
                name="question"
                required
                placeholder="New question"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <textarea
                name="answer"
                required
                rows={2}
                placeholder="Answer"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button type="submit" className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                <Plus className="h-3.5 w-3.5" />
                Add Question
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-ink-900">New Category</h2>
        <form action={addFaqCategoryAction} className="mt-3 flex gap-3">
          <input
            name="category"
            required
            placeholder="Category name"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
}
