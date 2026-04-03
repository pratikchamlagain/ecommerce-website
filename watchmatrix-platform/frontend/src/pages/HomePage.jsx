import PageShell from "../components/common/PageShell";

export default function HomePage() {
  const highlights = [
    { title: "Server-backed Catalog", text: "Products now come from Express + PostgreSQL, not hardcoded HTML blocks." },
    { title: "Secure Accounts", text: "JWT auth with protected profile and cart endpoints is now active." },
    { title: "Tailwind UI System", text: "Reusable visual language across pages for a cleaner and more realistic storefront." }
  ];

  const categories = ["Men", "Women", "Kids", "Luxury"];

  return (
    <PageShell title="Crafted For Every Moment">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 p-6">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-amber-200/90">New Generation WatchMatrix</p>
          <h3 className="mb-3 mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
            From holiday static build to a full-stack commerce platform.
          </h3>
          <p className="m-0 max-w-2xl text-slate-300">
            We are now fully structured for scale with React, Node.js, and PostgreSQL. The next iterations will focus on richer
            product storytelling, checkout confidence, and production-grade polish.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1 text-xs tracking-wide text-amber-100" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/15 bg-slate-900/70 p-6">
          <p className="m-0 text-sm font-semibold text-white">Migration Progress</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            <li>Backend API and auth routes are running</li>
            <li>Database seeding for categories and products is active</li>
            <li>Products and cart pages are already connected</li>
          </ul>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5" key={item.title}>
            <h4 className="m-0 text-lg font-semibold text-white">{item.title}</h4>
            <p className="mb-0 mt-2 text-sm text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
