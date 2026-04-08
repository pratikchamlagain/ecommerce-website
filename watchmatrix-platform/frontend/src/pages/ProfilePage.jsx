import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { fetchMe } from "../lib/authApi";
import { clearAuthSession } from "../lib/authStorage";
import { fetchMyOrders } from "../lib/ordersApi";
import { fetchMyNotifications, markNotificationRead } from "../lib/notificationsApi";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe
  });

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders
  });

  const notificationsQuery = useQuery({
    queryKey: ["my-notifications"],
    queryFn: fetchMyNotifications
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    }
  });

  function onLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  return (
    <PageShell title="My Profile">
      {profileQuery.isPending ? <p className="text-slate-300">Loading profile...</p> : null}
      {profileQuery.isError ? <p className="text-rose-300">Unable to load profile. Please sign in again.</p> : null}

      {profileQuery.data ? (
        <>
          <div className="wm-card max-w-[460px] p-5">
            <p className="text-slate-700"><strong>Name:</strong> {profileQuery.data.fullName}</p>
            <p className="text-slate-700"><strong>Email:</strong> {profileQuery.data.email}</p>
            <p className="text-slate-700"><strong>Role:</strong> {profileQuery.data.role}</p>
            <button className="wm-btn-secondary rounded-full px-4" type="button" onClick={onLogout}>Logout</button>
          </div>

          <section className="mt-6">
            <h3 className="m-0 text-2xl text-slate-900">My Orders</h3>
            {ordersQuery.isPending ? <p className="wm-muted mt-2">Loading orders...</p> : null}
            {ordersQuery.isError ? <p className="mt-2 text-sm text-rose-600">Could not load your orders.</p> : null}

            {!ordersQuery.isPending && !ordersQuery.isError && (ordersQuery.data || []).length === 0 ? (
              <p className="wm-muted mt-2">You have not placed any orders yet.</p>
            ) : null}

            <div className="mt-3 grid gap-3">
              {(ordersQuery.data || []).map((order) => (
                <article className="wm-card p-4" key={order.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="m-0 font-semibold text-slate-900">Order #{order.id}</p>
                      <p className="m-0 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleString()} | {order.paymentMethod} | {order.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="m-0 text-sm font-semibold text-slate-900">Rs. {Number(order.totalAmount).toFixed(2)}</p>
                      <Link className="wm-btn-secondary" to={`/orders/${order.id}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="m-0 text-2xl text-slate-900">Order Updates</h3>

            {notificationsQuery.isPending ? <p className="wm-muted mt-2">Loading updates...</p> : null}
            {notificationsQuery.isError ? <p className="mt-2 text-sm text-rose-600">Could not load notifications.</p> : null}

            {!notificationsQuery.isPending && !notificationsQuery.isError && (notificationsQuery.data || []).length === 0 ? (
              <p className="wm-muted mt-2">No updates yet.</p>
            ) : null}

            <div className="mt-3 grid gap-2">
              {(notificationsQuery.data || []).map((notification) => (
                <article className="wm-card p-3" key={notification.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 font-semibold text-slate-900">{notification.title}</p>
                      <p className="m-0 mt-1 text-sm text-slate-600">{notification.message}</p>
                      <p className="m-0 mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>

                    {!notification.isRead ? (
                      <button
                        className="wm-btn-secondary px-3 py-1 text-xs"
                        type="button"
                        disabled={readMutation.isPending}
                        onClick={() => readMutation.mutate(notification.id)}
                      >
                        Mark Read
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Read</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
