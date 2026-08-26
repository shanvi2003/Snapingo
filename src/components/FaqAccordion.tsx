import { ChevronDown } from "lucide-react";
import type { FaqCategory } from "@/data/faq";

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  return (
    <div className="space-y-12">
      {categories.map((cat) => (
        <div key={cat.category}>
          <h2 className="font-heading text-xl font-bold text-ink-900 sm:text-2xl">
            {cat.category}
          </h2>
          <div className="mt-5 space-y-3">
            {cat.items.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-ink-100 bg-white px-5 py-4 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-ink-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-900">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
