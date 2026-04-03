import PageShell from "../components/common/PageShell";

export default function AboutPage() {
  return (
    <PageShell title="About WatchMatrix">
      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Our Direction</h3>
          <p className="mb-0 mt-3 text-sm text-slate-300">
            WatchMatrix started as a static showcase and is now being rebuilt into a reliable commerce product. The goal is simple:
            premium browsing, fast checkout, and trust-first experience.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="m-0 text-xl font-semibold text-white">What Changed</h3>
          <ul className="mb-0 mt-3 grid gap-2 text-sm text-slate-300">
            <li>React front-end with routed pages and shared UI shell</li>
            <li>Node.js + Prisma backend for products, auth, and cart</li>
            <li>PostgreSQL storage for real, scalable data management</li>
          </ul>
        </article>
      </section>
    </PageShell>
  );
}
