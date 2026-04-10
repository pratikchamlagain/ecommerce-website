import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";

export default function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  const provider = (searchParams.get("provider") || "").toUpperCase();
  const ref = searchParams.get("ref") || "";

  return (
    <PageShell title="Payment Failed">
      <section className="wm-panel border-rose-300 bg-rose-50 p-5">
        <h3 className="m-0 text-2xl text-rose-800">Payment was not completed</h3>
        <p className="m-0 mt-2 text-sm text-rose-700">Provider: {provider || "Unknown"}</p>
        {ref ? <p className="m-0 mt-1 text-xs text-rose-700">Reference: {ref}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="wm-btn-primary" to="/checkout">Retry Checkout</Link>
          <Link className="wm-btn-secondary" to="/cart">Back To Cart</Link>
        </div>
      </section>
    </PageShell>
  );
}
