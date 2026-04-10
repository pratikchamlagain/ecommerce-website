import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchAdminPaymentHistory } from "../lib/paymentsApi";

export default function AdminPaymentHistoryPage() {
  const historyQuery = useQuery({
    queryKey: ["payment-history", "admin"],
    queryFn: () => fetchAdminPaymentHistory({ page: 1, limit: 30 })
  });

  const items = historyQuery.data?.items || [];

  return (
    <PageShell title="Admin Payment History">
      {historyQuery.isPending ? <p className="wm-muted">Loading payment history...</p> : null}
      {historyQuery.isError ? <p className="text-rose-600">Could not load admin payment history.</p> : null}

      {!historyQuery.isPending && !historyQuery.isError && items.length === 0 ? (
        <p className="wm-muted">No payment records available.</p>
      ) : null}

      {items.length > 0 ? (
        <div className="wm-card overflow-x-auto p-4">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Order</th>
                <th className="py-2 pr-3 font-semibold">Customer</th>
                <th className="py-2 pr-3 font-semibold">Provider</th>
                <th className="py-2 pr-3 font-semibold">Amount</th>
                <th className="py-2 pr-3 font-semibold">Payment Status</th>
                <th className="py-2 pr-3 font-semibold">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-2 pr-3 text-slate-700">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-3 text-slate-900">#{item.orderId}</td>
                  <td className="py-2 pr-3 text-slate-700">
                    <div>{item.customerName}</div>
                    <div className="text-xs text-slate-500">{item.customerEmail}</div>
                  </td>
                  <td className="py-2 pr-3 text-slate-700">{item.provider}</td>
                  <td className="py-2 pr-3 text-slate-900">Rs. {Number(item.amount).toFixed(2)}</td>
                  <td className="py-2 pr-3 text-slate-700">{item.paymentStatus}</td>
                  <td className="py-2 pr-3 text-slate-700">{item.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageShell>
  );
}
