import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchAdminOverview, fetchAdminSellers, updateSellerStatus } from "../lib/adminApi";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview
  });

  const sellersQuery = useQuery({
    queryKey: ["admin-sellers"],
    queryFn: fetchAdminSellers
  });

  const overview = overviewQuery.data;
  const sellers = sellersQuery.data || [];

  const statusMutation = useMutation({
    mutationFn: ({ sellerId, isActive }) => updateSellerStatus(sellerId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    }
  });

  return (
    <PageShell title="Admin Dashboard">
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

        {sellersQuery.isPending ? <p className="wm-muted mt-3">Loading sellers...</p> : null}
        {sellersQuery.isError ? <p className="mt-3 text-sm text-rose-600">Could not load sellers list.</p> : null}

        {!sellersQuery.isPending && !sellersQuery.isError && sellers.length === 0 ? (
          <p className="wm-muted mt-3">No sellers found yet.</p>
        ) : null}

        {sellers.length > 0 ? (
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
                        onClick={() => statusMutation.mutate({ sellerId: seller.id, isActive: !seller.isActive })}
                      >
                        {seller.isActive ? "Suspend" : "Activate"}
                      </button>
                    </td>
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
    </PageShell>
  );
}
