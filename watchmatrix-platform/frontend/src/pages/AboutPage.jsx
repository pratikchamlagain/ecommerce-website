import PageShell from "../components/common/PageShell";

export default function AboutPage() {
  return (
    <PageShell title="About WatchMatrix">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="wm-panel p-6">
          <h3 className="m-0 text-2xl font-semibold text-slate-900">Who We Are</h3>
          <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
            WatchMatrix is a trusted online marketplace where customers discover verified pre-owned and premium watches,
            sellers manage listings, and support teams resolve post-order issues through built-in order-aware chat.
          </p>
          <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
            Every part of the platform is built around confidence: transparent product details, secure checkout flows,
            payment verification, and clear order tracking from purchase to delivery.
          </p>
        </article>
        <article className="wm-panel p-6">
          <h3 className="m-0 text-2xl font-semibold text-slate-900">Platform Highlights</h3>
          <ul className="mb-0 mt-3 grid gap-2 text-sm text-slate-700">
            <li>Structured shopping experience with category galleries and featured deals</li>
            <li>Role-based accounts for customer, seller, and admin operations</li>
            <li>Integrated checkout with verified payment workflows and order creation</li>
            <li>Live chat linked to orders, including escalation to admin when needed</li>
            <li>Notification and history views for both buyers and operations teams</li>
          </ul>
        </article>
      </section>
    </PageShell>
  );
}
