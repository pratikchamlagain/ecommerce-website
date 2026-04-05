import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchOrderById } from "../lib/ordersApi";

export default function OrderDetailPage() {
  const { orderId = "" } = useParams();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: Boolean(orderId)
  });

  const order = orderQuery.data;

  return (
    <PageShell title="Order Details">
      <div className="mb-4 flex flex-wrap gap-2">
        <Link className="wm-btn-secondary" to="/profile">
          Back to Profile
        </Link>
        <Link className="wm-btn-secondary" to="/products?page=1">
          Shop More
        </Link>
      </div>

      {orderQuery.isPending ? <p className="wm-muted">Loading order details...</p> : null}
      {orderQuery.isError ? <p className="text-rose-600">Could not load this order.</p> : null}

      {order ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <article className="wm-panel p-5">
            <h3 className="m-0 text-2xl text-slate-900">Order #{order.id}</h3>
            <p className="mb-0 mt-2 text-sm text-slate-700">
              Status: <strong>{order.status}</strong> | Payment: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="mb-0 mt-1 text-sm text-slate-700">
              Placed on: <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            </p>

            <h4 className="mb-2 mt-5 text-xl text-slate-900">Items</h4>
            <div className="grid gap-2">
              {order.items.map((item) => (
                <div className="rounded-xl border border-black/10 bg-white p-3" key={item.id}>
                  <p className="m-0 font-semibold text-slate-900">{item.productName}</p>
                  <p className="m-0 text-sm text-slate-600">{item.productBrand}</p>
                  <p className="m-0 mt-1 text-sm text-slate-700">
                    Qty: {item.quantity} x Rs. {Number(item.unitPrice).toFixed(2)}
                  </p>
                  <p className="m-0 text-sm font-semibold text-slate-900">Subtotal: Rs. {Number(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="wm-card p-5">
            <h4 className="m-0 text-xl text-slate-900">Shipping Details</h4>
            <div className="mt-3 grid gap-1 text-sm text-slate-700">
              <p className="m-0"><strong>Name:</strong> {order.shipping.fullName}</p>
              <p className="m-0"><strong>Email:</strong> {order.shipping.email}</p>
              <p className="m-0"><strong>Phone:</strong> {order.shipping.phone}</p>
              <p className="m-0"><strong>Address:</strong> {order.shipping.addressLine1}</p>
              {order.shipping.addressLine2 ? <p className="m-0">{order.shipping.addressLine2}</p> : null}
              <p className="m-0">
                <strong>City / Postal:</strong> {order.shipping.city} / {order.shipping.postalCode}
              </p>
              {order.shipping.notes ? <p className="m-0"><strong>Notes:</strong> {order.shipping.notes}</p> : null}
            </div>

            <p className="mt-5 text-lg font-semibold text-slate-900">
              Total: Rs. {Number(order.totalAmount).toFixed(2)}
            </p>
          </article>
        </section>
      ) : null}
    </PageShell>
  );
}
