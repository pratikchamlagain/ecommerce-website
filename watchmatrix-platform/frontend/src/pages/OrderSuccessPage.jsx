import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { fetchOrderById } from "../lib/ordersApi";

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderFromState = location.state?.order;
  const orderId = searchParams.get("orderId") || orderFromState?.id || "";

  const orderQuery = useQuery({
    queryKey: ["order-success", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: Boolean(orderId && !orderFromState)
  });

  const order = orderFromState || orderQuery.data;

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
            <p className="m-0">
              <strong>Status:</strong> {order.status}
            </p>
          </div>
        ) : (
          <>
            {orderQuery.isPending ? <p className="mb-0 mt-3 text-sm text-emerald-900">Loading order details...</p> : null}
            {orderQuery.isError ? <p className="mb-0 mt-3 text-sm text-rose-700">Order placed, but details could not be loaded. Check your profile orders.</p> : null}
            {!orderQuery.isPending && !orderQuery.isError ? (
              <p className="mb-0 mt-3 text-sm text-emerald-900">Your order has been placed successfully.</p>
            ) : null}
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="wm-btn-primary" to="/products?page=1">
            Continue Shopping
          </Link>
          {order?.id ? (
            <Link className="wm-btn-secondary" to={`/orders/${order.id}`}>
              Track This Order
            </Link>
          ) : null}
          <Link className="wm-btn-secondary" to="/profile">
            Go To Profile
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
