import PageShell from "../components/common/PageShell";

export default function CheckoutPage() {
  return (
    <PageShell title="Checkout">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Shipping & Contact</h3>
          <p className="mb-0 mt-2 text-sm text-slate-300">
            Address form, contact details, and delivery options are the next milestone in this flow.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Order Preview</h3>
          <ul className="mb-0 mt-2 grid gap-2 text-sm text-slate-300">
            <li>Subtotal and shipping breakdown</li>
            <li>Payment method selection</li>
            <li>Order placement confirmation</li>
          </ul>
        </article>
      </section>

      <button className="mt-5 rounded-full border border-amber-200/50 bg-amber-200/10 px-4 py-2 font-medium text-amber-100 hover:bg-amber-200/20" type="button">
        Continue To Payment
      </button>
    </PageShell>
  );
}
