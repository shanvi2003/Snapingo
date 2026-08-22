export default function LegalHero({ title }: { title: string }) {
  return (
    <section className="pb-2 pt-28 sm:pb-3 sm:pt-32">
      <div className="container-app">
        <h1 className="max-w-2xl font-heading text-3xl font-bold leading-[1.1] text-ink-900 sm:text-4xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
