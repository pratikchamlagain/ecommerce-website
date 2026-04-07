import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import {
  fetchAdminAuditLogs,
  fetchAdminOverview,
  fetchAdminSellers,
  updateSellerStatus
} from "../lib/adminApi";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState(null);
  const [toasts, setToasts] = useState([]);

  function pushToast(type, message) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2600);
  }

  const sellerQueryParams = useMemo(() => ({
    search: search.trim() || undefined,
    status,
    page,
    limit: 8
  }), [page, search, status]);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview
  });

  const sellersQuery = useQuery({
    queryKey: ["admin-sellers", sellerQueryParams],
    queryFn: () => fetchAdminSellers(sellerQueryParams)
  });

  const auditLogsQuery = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => fetchAdminAuditLogs({ page: 1, limit: 8 })
  });

  const overview = overviewQuery.data;
  const sellers = sellersQuery.data?.items || [];
  const sellersPagination = sellersQuery.data?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ sellerId, isActive }) => updateSellerStatus(sellerId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      pushToast("success", "Seller status updated successfully.");
      setPendingAction(null);
    },
    onError: (error) => {
      pushToast("error", error?.response?.data?.message || "Could not update seller status.");
      setPendingAction(null);
    }
  });

  function requestStatusChange(seller) {
    setPendingAction({
      sellerId: seller.id,
      sellerName: seller.fullName,
      nextIsActive: !seller.isActive
    });
  }

  function confirmStatusChange() {
    if (!pendingAction || statusMutation.isPending) {
      return;
    }

    statusMutation.mutate({
      sellerId: pendingAction.sellerId,
      isActive: pendingAction.nextIsActive
    });
  }

  return (
    <PageShell title="Admin Dashboard">
      <div className="fixed right-4 top-4 z-40 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            className={toast.type === "success"
              ? "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow"
              : "rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 shadow"}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {overviewQuery.isPending ? <p className="wm-muted">Loading admin metrics...</p> : null}
      {overviewQuery.isError ? <p className="text-rose-600">Could not load admin overview.</p> : null}

      {overview ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="wm-card p-4">
            <p className="m-0 text-sm text-slate-500">Total Users</p>
            <h3 className="m-0 mt-2 text-3xl text-slate-900">{overview.users}</h3>
          </article>
          <article className="wm-card p-4">
            <p className="m-0 text-sm text-slate-500">Sellers</p>
            <h3 className="m-0 mt-2 text-3xl text-slate-900">{overview.sellers}</h3>
            <p className="m-0 mt-1 text-xs text-slate-500">Active: {overview.activeSellers} | Suspended: {overview.suspendedSellers}</p>
          </article>
          <article className="wm-card p-4">
            <p className="m-0 text-sm text-slate-500">Total Products</p>
            <h3 className="m-0 mt-2 text-3xl text-slate-900">{overview.products}</h3>
            <p className="m-0 mt-1 text-xs text-slate-500">Seller listings: {overview.sellerProducts}</p>
          </article>
          <article className="wm-card p-4">
            <p className="m-0 text-sm text-slate-500">Total Revenue</p>
            <h3 className="m-0 mt-2 text-3xl text-slate-900">Rs. {Number(overview.totalRevenue).toFixed(2)}</h3>
            <p className="m-0 mt-1 text-xs text-slate-500">Orders: {overview.orders}</p>
          </article>
        </section>
      ) : null}

      <section className="wm-card mt-6 p-5">
        <h3 className="m-0 text-xl text-slate-900">Seller Intelligence</h3>
        <p className="m-0 mt-1 text-sm text-slate-600">Live sellers with listing and stock summary.</p>

        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_180px]">
          <input
            className="wm-input"
            placeholder="Search by seller name or email"
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <select
            className="wm-input"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        {sellersQuery.isPending ? <p className="wm-muted mt-3">Loading sellers...</p> : null}
        {sellersQuery.isError ? <p className="mt-3 text-sm text-rose-600">Could not load sellers list.</p> : null}

        {!sellersQuery.isPending && !sellersQuery.isError && sellers.length === 0 ? (
          <p className="wm-muted mt-3">No sellers found yet.</p>
        ) : null}

        {sellers.length > 0 ? (
          <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Seller</th>
                  <th className="py-2 pr-3 font-semibold">Email</th>
                  <th className="py-2 pr-3 font-semibold">Listings</th>
                  <th className="py-2 pr-3 font-semibold">Total Stock</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Joined</th>
                  <th className="py-2 pr-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr className="border-b border-slate-100" key={seller.id}>
                    <td className="py-2 pr-3 text-slate-900">{seller.fullName}</td>
                    <td className="py-2 pr-3 text-slate-600">{seller.email}</td>
                    <td className="py-2 pr-3 text-slate-900">{seller.listings}</td>
                    <td className="py-2 pr-3 text-slate-900">{seller.totalStock}</td>
                    <td className="py-2 pr-3">
                      {seller.isActive ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Suspended</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{new Date(seller.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">
                      <button
                        className="wm-btn-secondary px-3 py-1 text-xs"
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => requestStatusChange(seller)}
                      >
                        {seller.isActive ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sellersPagination ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                className="wm-btn-secondary px-4"
                type="button"
                disabled={sellersPagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <p className="m-0 text-sm text-slate-600">
                Page {sellersPagination.page} of {sellersPagination.totalPages} | Total {sellersPagination.total}
              </p>
              <button
                className="wm-btn-secondary px-4"
                type="button"
                disabled={sellersPagination.page >= sellersPagination.totalPages}
                onClick={() => setPage((prev) => Math.min(sellersPagination.totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          ) : null}
          </>
        ) : null}
      </section>

      <section className="wm-card mt-6 p-5">
        <h3 className="m-0 text-xl text-slate-900">Recent Admin Actions</h3>
        <p className="m-0 mt-1 text-sm text-slate-600">Audit trail for seller status changes.</p>

        {auditLogsQuery.isPending ? <p className="wm-muted mt-3">Loading audit logs...</p> : null}
        {auditLogsQuery.isError ? <p className="mt-3 text-sm text-rose-600">Could not load audit logs.</p> : null}

        {!auditLogsQuery.isPending && !auditLogsQuery.isError && (auditLogsQuery.data?.items || []).length === 0 ? (
          <p className="wm-muted mt-3">No admin actions recorded yet.</p>
        ) : null}

        {(auditLogsQuery.data?.items || []).length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Time</th>
                  <th className="py-2 pr-3 font-semibold">Admin</th>
                  <th className="py-2 pr-3 font-semibold">Action</th>
                  <th className="py-2 pr-3 font-semibold">Target</th>
                  <th className="py-2 pr-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {(auditLogsQuery.data?.items || []).map((log) => (
                  <tr className="border-b border-slate-100" key={log.id}>
                    <td className="py-2 pr-3 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-slate-900">{log.admin?.fullName || "Unknown admin"}</td>
                    <td className="py-2 pr-3 text-slate-900">{log.action}</td>
                    <td className="py-2 pr-3 text-slate-600">{log.targetUser?.fullName || "Unknown seller"}</td>
                    <td className="py-2 pr-3 text-slate-600">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Next admin iteration: seller approval and suspension controls.
      </div>
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Today completed: live metrics + seller intelligence foundation.
      </div>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="m-0 text-lg font-semibold text-slate-900">Confirm Seller Status Change</h3>
            <p className="mt-2 text-sm text-slate-600">
              {pendingAction.nextIsActive
                ? `Activate ${pendingAction.sellerName}? They will be able to log in and use seller features again.`
                : `Suspend ${pendingAction.sellerName}? They will be blocked from login and protected seller actions.`}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="wm-btn-secondary px-4"
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={statusMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="wm-btn-primary px-4"
                type="button"
                onClick={confirmStatusChange}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending
                  ? "Saving..."
                  : pendingAction.nextIsActive ? "Activate Seller" : "Suspend Seller"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
