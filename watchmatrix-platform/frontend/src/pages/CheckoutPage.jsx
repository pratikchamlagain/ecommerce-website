import PageShell from "../components/common/PageShell";

export default function CheckoutPage() {
  return (
    <PageShell title="Checkout">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <article className="wm-panel p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Shipping & Contact</h3>
          <p className="mb-0 mt-2 text-sm text-slate-300">
            Address form, contact details, and delivery options are the next milestone in this flow.
          </p>
        </article>
        <article className="wm-card p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Order Preview</h3>
          <ul className="mb-0 mt-2 grid gap-2 text-sm text-slate-300">
            <li>Subtotal and shipping breakdown</li>
            <li>Payment method selection</li>
            <li>Order placement confirmation</li>
          </ul>
        </article>
      </section>

      <button className="wm-btn-primary mt-5" type="button">
        Continue To Payment
      </button>
    </PageShell>
  );
}
