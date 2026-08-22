export default function LegalList({
  items,
}: {
  items: { label?: string; text: string }[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
          <span>
            {item.label && <span className="font-bold text-ink-900">{item.label}: </span>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
