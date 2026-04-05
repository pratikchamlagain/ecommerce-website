import { Link, useLocation } from "react-router-dom";
import PageShell from "../components/common/PageShell";

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <PageShell title="Order Success">
      <section className="wm-panel border-emerald-400/40 bg-emerald-50 p-6">
        <h3 className="m-0 text-3xl text-emerald-800">Thank You! Your Order Is Confirmed</h3>

        {order ? (
          <div className="mt-3 grid gap-2 text-sm text-emerald-900">
            <p className="m-0">
              <strong>Order ID:</strong> {order.id}
            </p>
            <p className="m-0">
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
            <p className="m-0">
              <strong>Total:</strong> Rs. {Number(order.totalAmount).toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="mb-0 mt-3 text-sm text-emerald-900">
            Your order has been placed successfully.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="wm-btn-primary" to="/products?page=1">
            Continue Shopping
          </Link>
          <Link className="wm-btn-secondary" to="/profile">
            Go To Profile
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
