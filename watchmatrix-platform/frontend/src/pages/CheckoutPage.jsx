import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import CheckoutProgress from "../components/common/CheckoutProgress";
import { fetchCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";

export default function CheckoutPage() {
  const token = getAccessToken();

  const cartQuery = useQuery({
    queryKey: ["cart", "checkout"],
    queryFn: fetchCart,
    enabled: Boolean(token)
  });

  const cart = cartQuery.data;

  return (
    <PageShell title="Checkout">
      <CheckoutProgress currentStep={2} />

      {!token ? (
        <section className="wm-panel mb-4">
          <p className="m-0 text-slate-300">Please sign in to continue checkout.</p>
          <Link className="wm-btn-primary mt-3 inline-flex" to="/login">Go to Login</Link>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <article className="wm-panel p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Shipping & Contact</h3>
          <p className="mb-0 mt-2 text-sm text-slate-300">
            Address form, contact details, and delivery options are the next milestone in this flow.
          </p>
        </article>
        <article className="wm-card p-5">
          <h3 className="m-0 text-xl font-semibold text-white">Order Preview</h3>
          {cartQuery.isPending ? <p className="mt-2 text-sm text-slate-300">Loading cart summary...</p> : null}
          {cartQuery.isError ? <p className="mt-2 text-sm text-rose-300">Could not load checkout summary.</p> : null}

          {cart ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <p className="m-0"><strong>Items:</strong> {cart.totals.totalItems}</p>
              <p className="m-0"><strong>Subtotal:</strong> <span className="wm-price">Rs. {cart.totals.totalAmount.toFixed(2)}</span></p>
              <p className="m-0"><strong>Shipping:</strong> Rs. 0.00</p>
              <p className="m-0 text-base font-semibold"><strong>Total:</strong> <span className="wm-price">Rs. {cart.totals.totalAmount.toFixed(2)}</span></p>
            </div>
          ) : (
            <ul className="mb-0 mt-2 grid gap-2 text-sm text-slate-300">
              <li>Subtotal and shipping breakdown</li>
              <li>Payment method selection</li>
              <li>Order placement confirmation</li>
            </ul>
          )}
        </article>
      </section>

      <button className="wm-btn-primary mt-5" type="button" disabled={!token || !cart || cart.items.length === 0}>
        Continue To Payment
      </button>
    </PageShell>
  );
}
