import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchAdminOrderById } from "../lib/adminApi";

function statusChip(status) {
  if (status === "DELIVERED") return "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700";
  if (status === "SHIPPED") return "rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700";
  if (status === "PACKED") return "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700";
  if (status === "CANCELLED") return "rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700";
  return "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700";
}

export default function AdminOrderDetailPage() {
  const { orderId = "" } = useParams();

  const orderQuery = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchAdminOrderById(orderId),
    enabled: Boolean(orderId)
  });

  const order = orderQuery.data;

  return (
    <PageShell title="Admin Order Detail">
      <div className="mb-4">
        <Link className="wm-btn-secondary" to="/admin">Back to Admin Dashboard</Link>
      </div>

      {orderQuery.isPending ? <p className="wm-muted">Loading order detail...</p> : null}
      {orderQuery.isError ? <p className="text-rose-600">Could not load this order.</p> : null}

      {order ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.92fr]">
          <article className="wm-panel p-5">
            <h3 className="m-0 text-2xl text-slate-900">Order #{order.id}</h3>
            <p className="m-0 mt-2 text-sm text-slate-700">
              Status: <strong>{order.status}</strong> | Payment: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="m-0 mt-1 text-sm text-slate-700">Placed: <strong>{new Date(order.createdAt).toLocaleString()}</strong></p>

            <h4 className="m-0 mt-5 text-xl text-slate-900">Item Fulfillment Timeline</h4>
            <div className="mt-3 grid gap-2">
              {order.items.map((item) => (
                <div className="rounded-xl border border-black/10 bg-white p-3" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="m-0 font-semibold text-slate-900">{item.productName}</p>
                      <p className="m-0 text-xs text-slate-600">{item.productBrand} | Qty {item.quantity}</p>
                      <p className="m-0 text-xs text-slate-600">Seller: {item.seller?.fullName || "Marketplace"}</p>
                    </div>
                    <span className={statusChip(item.sellerStatus)}>{item.sellerStatus}</span>
                  </div>

                  <div className="mt-2 grid gap-1 text-xs text-slate-600">
                    <p className="m-0">Subtotal: Rs. {Number(item.subtotal).toFixed(2)}</p>
                    {item.courierName || item.trackingNumber ? (
                      <p className="m-0">
                        Courier: {item.courierName || "-"} | Tracking: {item.trackingNumber || "-"}
                      </p>
                    ) : null}
                    {item.shippedAt ? <p className="m-0">Shipped: {new Date(item.shippedAt).toLocaleString()}</p> : null}
                    {item.deliveredAt ? <p className="m-0">Delivered: {new Date(item.deliveredAt).toLocaleString()}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="wm-card p-5">
            <h4 className="m-0 text-xl text-slate-900">Customer & Shipping</h4>
            <div className="mt-3 grid gap-1 text-sm text-slate-700">
              <p className="m-0"><strong>Name:</strong> {order.customer.fullName}</p>
              <p className="m-0"><strong>Email:</strong> {order.customer.email}</p>
              <p className="m-0"><strong>Phone:</strong> {order.customer.phone}</p>
              <p className="m-0"><strong>Address:</strong> {order.shipping.addressLine1}</p>
              {order.shipping.addressLine2 ? <p className="m-0">{order.shipping.addressLine2}</p> : null}
              <p className="m-0"><strong>City / Postal:</strong> {order.shipping.city} / {order.shipping.postalCode}</p>
              {order.shipping.notes ? <p className="m-0"><strong>Notes:</strong> {order.shipping.notes}</p> : null}
            </div>

            <p className="m-0 mt-5 text-lg font-semibold text-slate-900">Total: Rs. {Number(order.totalAmount).toFixed(2)}</p>
          </article>
        </section>
      ) : null}
    </PageShell>
  );
}