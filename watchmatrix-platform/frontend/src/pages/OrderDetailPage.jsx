import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { cancelOrderById, fetchOrderById } from "../lib/ordersApi";

const fulfillmentSteps = ["PENDING", "PACKED", "SHIPPED", "DELIVERED"];

function getStatusChipClass(status) {
  if (status === "DELIVERED") return "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700";
  if (status === "SHIPPED") return "rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700";
  if (status === "PACKED") return "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700";
  if (status === "CANCELLED") return "rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700";
  return "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700";
}

function getStepState(currentStatus, step) {
  if (currentStatus === "CANCELLED") {
    return "pending";
  }

  const currentIndex = fulfillmentSteps.indexOf(currentStatus);
  const stepIndex = fulfillmentSteps.indexOf(step);

  if (stepIndex <= currentIndex) {
    return "done";
  }

  return "pending";
}

function getStepClass(state) {
  return state === "done"
    ? "h-2 rounded-full bg-emerald-500"
    : "h-2 rounded-full bg-slate-200";
}

export default function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: Boolean(orderId)
  });

  const order = orderQuery.data;

  const cancelMutation = useMutation({
    mutationFn: cancelOrderById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    }
  });

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

            {order.isCancelableByCustomer ? (
              <div className="mt-3">
                <button
                  className="wm-btn-secondary"
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(order.id)}
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel This Order"}
                </button>
                {cancelMutation.isError ? (
                  <p className="m-0 mt-2 text-xs text-rose-600">
                    {cancelMutation.error?.response?.data?.message || "Unable to cancel this order right now."}
                  </p>
                ) : null}
              </div>
            ) : null}

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

                  {item.sellerId ? (
                    <div className="mt-2">
                      <Link
                        className="wm-btn-secondary px-3 py-1 text-xs"
                        to={`/chat?participantId=${item.sellerId}&orderId=${order.id}`}
                      >
                        Chat Seller
                      </Link>
                    </div>
                  ) : null}

                  <div className="mt-2">
                    <span className={getStatusChipClass(item.sellerStatus || "PENDING")}>{item.sellerStatus || "PENDING"}</span>
                  </div>

                  {item.courierName || item.trackingNumber ? (
                    <p className="m-0 mt-2 text-xs text-slate-700">
                      {item.courierName ? `Courier: ${item.courierName}` : "Courier: -"}
                      {" | "}
                      {item.trackingNumber ? `Tracking: ${item.trackingNumber}` : "Tracking: -"}
                    </p>
                  ) : null}

                  {item.sellerStatus === "CANCELLED" ? (
                    <p className="m-0 mt-2 text-xs font-semibold text-rose-700">This item was cancelled by seller fulfillment workflow.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {fulfillmentSteps.map((step) => {
                        const state = getStepState(item.sellerStatus || "PENDING", step);

                        return (
                          <div key={`${item.id}-${step}`}>
                            <div className={getStepClass(state)} />
                            <p className="m-0 mt-1 text-[11px] font-semibold text-slate-600">{step}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
