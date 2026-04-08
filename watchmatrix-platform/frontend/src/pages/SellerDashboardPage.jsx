import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import {
  createSellerProduct,
  deleteSellerProduct,
  fetchSellerCategories,
  fetchSellerFulfillmentLogs,
  fetchSellerOrderItems,
  fetchSellerProducts,
  updateSellerOrderItemStatus,
  updateSellerProduct
} from "../lib/sellerProductsApi";

export default function SellerDashboardPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    stock: "",
    imageUrl: "",
    categorySlug: ""
  });

  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts
  });

  const categoriesQuery = useQuery({
    queryKey: ["seller-categories"],
    queryFn: fetchSellerCategories
  });

  const sellerOrdersQuery = useQuery({
    queryKey: ["seller-order-items", orderStatus, orderPage],
    queryFn: () => fetchSellerOrderItems({ page: orderPage, limit: 8, status: orderStatus || undefined })
  });

  const fulfillmentLogsQuery = useQuery({
    queryKey: ["seller-fulfillment-logs"],
    queryFn: () => fetchSellerFulfillmentLogs({ page: 1, limit: 8 })
  });

  const createMutation = useMutation({
    mutationFn: createSellerProduct,
    onSuccess: () => {
      setForm({
        name: "",
        description: "",
        brand: "",
        price: "",
        stock: "",
        imageUrl: "",
        categorySlug: ""
      });
      setError("");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (mutationError) => {
      setError(mutationError?.response?.data?.message || "Failed to create product");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSellerProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order-items"] });
    }
  });

  const stockMutation = useMutation({
    mutationFn: ({ productId, stock }) => updateSellerProduct(productId, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    }
  });

  const sellerItemStatusMutation = useMutation({
    mutationFn: ({ itemId, sellerStatus }) => updateSellerOrderItemStatus(itemId, sellerStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-order-items"] });
      queryClient.invalidateQueries({ queryKey: ["seller-fulfillment-logs"] });
    }
  });

  const categoryOptions = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);

  function onChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function onCreate(event) {
    event.preventDefault();
    setError("");

    await createMutation.mutateAsync({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    });
  }

  async function onQuickStockUpdate(productId, nextStock) {
    if (Number.isNaN(nextStock) || nextStock < 0) {
      return;
    }

    await stockMutation.mutateAsync({ productId, stock: nextStock });
  }

  function getDraftStatus(item) {
    return orderStatusDrafts[item.id] || item.sellerStatus || "PENDING";
  }

  function getSellerStatusBadgeClass(statusValue) {
    if (statusValue === "DELIVERED") return "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700";
    if (statusValue === "SHIPPED") return "rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700";
    if (statusValue === "PACKED") return "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700";
    if (statusValue === "CANCELLED") return "rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700";
    return "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700";
  }

  async function onUpdateSellerItemStatus(item) {
    const draft = getDraftStatus(item);

    if (draft === item.sellerStatus) {
      return;
    }

    await sellerItemStatusMutation.mutateAsync({
      itemId: item.id,
      sellerStatus: draft
    });
  }

  return (
    <PageShell title="Seller Dashboard">
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form className="wm-card p-5" onSubmit={onCreate}>
          <h3 className="m-0 text-xl text-slate-900">Create Product Listing</h3>
          <p className="mt-2 text-sm text-slate-600">Add a new watch listing to your storefront.</p>

          <div className="mt-4 grid gap-2">
            <input className="wm-input" name="name" placeholder="Product name" value={form.name} onChange={onChange} required />
            <textarea className="wm-input min-h-24" name="description" placeholder="Description" value={form.description} onChange={onChange} required />
            <input className="wm-input" name="brand" placeholder="Brand" value={form.brand} onChange={onChange} required />
            <input className="wm-input" min="0.01" name="price" placeholder="Price" step="0.01" type="number" value={form.price} onChange={onChange} required />
            <input className="wm-input" min="0" name="stock" placeholder="Stock" type="number" value={form.stock} onChange={onChange} required />
            <input className="wm-input" name="imageUrl" placeholder="Image URL" type="url" value={form.imageUrl} onChange={onChange} required />

            <select className="wm-input" name="categorySlug" value={form.categorySlug} onChange={onChange} required>
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>

            {error ? <p className="m-0 text-sm text-rose-600">{error}</p> : null}

            <button className="wm-btn-primary" disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>

        <div className="wm-card p-5">
          <h3 className="m-0 text-xl text-slate-900">My Listings</h3>
          <p className="mt-2 text-sm text-slate-600">Manage your products and keep stock up to date.</p>

          {productsQuery.isPending ? <p className="wm-muted mt-4">Loading your products...</p> : null}
          {productsQuery.isError ? <p className="mt-4 text-sm text-rose-600">Unable to load products.</p> : null}

          {!productsQuery.isPending && !productsQuery.isError && (productsQuery.data || []).length === 0 ? (
            <p className="wm-muted mt-4">No listings yet. Create your first product.</p>
          ) : null}

          <div className="mt-4 grid gap-3">
            {(productsQuery.data || []).map((product) => (
              <article className="rounded-xl border border-slate-200 p-3" key={product.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="m-0 font-semibold text-slate-900">{product.name}</p>
                    <p className="m-0 text-sm text-slate-600">{product.brand} | {product.category?.name || "No category"}</p>
                    <p className="m-0 text-sm font-semibold text-slate-900">Rs. {Number(product.price).toFixed(2)}</p>
                  </div>

                  <button
                    className="wm-btn-secondary"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(product.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-sm text-slate-600" htmlFor={`stock-${product.id}`}>Stock</label>
                  <input
                    className="wm-input w-24"
                    defaultValue={product.stock}
                    id={`stock-${product.id}`}
                    min="0"
                    type="number"
                    onBlur={(event) => onQuickStockUpdate(product.id, Number(event.target.value))}
                  />
                  <span className="text-xs text-slate-500">Auto-save on blur</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wm-card mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-xl text-slate-900">My Sold Items</h3>
            <p className="m-0 mt-1 text-sm text-slate-600">Items from customer orders that include your products.</p>
          </div>

          <select
            className="wm-input w-[220px]"
            value={orderStatus}
            onChange={(event) => {
              setOrderStatus(event.target.value);
              setOrderPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {sellerOrdersQuery.isPending ? <p className="wm-muted mt-4">Loading sold items...</p> : null}
        {sellerOrdersQuery.isError ? <p className="mt-4 text-sm text-rose-600">Unable to load seller order items.</p> : null}

        {!sellerOrdersQuery.isPending && !sellerOrdersQuery.isError && (sellerOrdersQuery.data?.items || []).length === 0 ? (
          <p className="wm-muted mt-4">No sold items found for this filter.</p>
        ) : null}

        {(sellerOrdersQuery.data?.items || []).length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Order</th>
                  <th className="py-2 pr-3 font-semibold">Product</th>
                  <th className="py-2 pr-3 font-semibold">Qty</th>
                  <th className="py-2 pr-3 font-semibold">Subtotal</th>
                  <th className="py-2 pr-3 font-semibold">Customer</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Fulfillment</th>
                  <th className="py-2 pr-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody>
                {(sellerOrdersQuery.data?.items || []).map((item) => (
                  <tr className="border-b border-slate-100" key={item.id}>
                    <td className="py-2 pr-3 text-slate-700">#{item.order.id}</td>
                    <td className="py-2 pr-3">
                      <p className="m-0 font-semibold text-slate-900">{item.productName}</p>
                      <p className="m-0 text-xs text-slate-500">{item.productBrand}</p>
                    </td>
                    <td className="py-2 pr-3 text-slate-900">{item.quantity}</td>
                    <td className="py-2 pr-3 text-slate-900">Rs. {Number(item.subtotal).toFixed(2)}</td>
                    <td className="py-2 pr-3 text-slate-700">
                      <p className="m-0">{item.order.customerName}</p>
                      <p className="m-0 text-xs text-slate-500">{item.order.customerEmail}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {item.order.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="wm-input w-[140px] py-1 text-xs"
                          value={getDraftStatus(item)}
                          onChange={(event) => {
                            setOrderStatusDrafts((prev) => ({
                              ...prev,
                              [item.id]: event.target.value
                            }));
                          }}
                        >
                          {Array.from(new Set(item.editableStatuses || [item.sellerStatus])).map((statusValue) => (
                            <option key={`${item.id}-${statusValue}`} value={statusValue}>{statusValue}</option>
                          ))}
                        </select>
                        <button
                          className="wm-btn-secondary px-2 py-1 text-xs"
                          type="button"
                          disabled={sellerItemStatusMutation.isPending}
                          onClick={() => onUpdateSellerItemStatus(item)}
                        >
                          {sellerItemStatusMutation.isPending ? "Saving..." : "Update"}
                        </button>
                      </div>
                      <div className="mt-2">
                        <span className={getSellerStatusBadgeClass(item.sellerStatus)}>{item.sellerStatus}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{new Date(item.order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {sellerOrdersQuery.data?.pagination ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              className="wm-btn-secondary px-4"
              type="button"
              disabled={sellerOrdersQuery.data.pagination.page <= 1}
              onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <p className="m-0 text-sm text-slate-600">
              Page {sellerOrdersQuery.data.pagination.page} of {sellerOrdersQuery.data.pagination.totalPages} | Total {sellerOrdersQuery.data.pagination.total}
            </p>
            <button
              className="wm-btn-secondary px-4"
              type="button"
              disabled={sellerOrdersQuery.data.pagination.page >= sellerOrdersQuery.data.pagination.totalPages}
              onClick={() => setOrderPage((prev) => Math.min(sellerOrdersQuery.data.pagination.totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      <section className="wm-card mt-6 p-5">
        <h3 className="m-0 text-xl text-slate-900">Fulfillment History</h3>
        <p className="m-0 mt-1 text-sm text-slate-600">Recent status changes for your sold items.</p>

        {fulfillmentLogsQuery.isPending ? <p className="wm-muted mt-4">Loading fulfillment history...</p> : null}
        {fulfillmentLogsQuery.isError ? <p className="mt-4 text-sm text-rose-600">Unable to load fulfillment history.</p> : null}

        {!fulfillmentLogsQuery.isPending && !fulfillmentLogsQuery.isError && (fulfillmentLogsQuery.data?.items || []).length === 0 ? (
          <p className="wm-muted mt-4">No fulfillment actions recorded yet.</p>
        ) : null}

        {(fulfillmentLogsQuery.data?.items || []).length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Time</th>
                  <th className="py-2 pr-3 font-semibold">Order</th>
                  <th className="py-2 pr-3 font-semibold">Product</th>
                  <th className="py-2 pr-3 font-semibold">Transition</th>
                </tr>
              </thead>
              <tbody>
                {(fulfillmentLogsQuery.data?.items || []).map((log) => (
                  <tr className="border-b border-slate-100" key={log.id}>
                    <td className="py-2 pr-3 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-slate-700">#{log.orderId || "-"}</td>
                    <td className="py-2 pr-3 text-slate-900">{log.productName}</td>
                    <td className="py-2 pr-3 text-slate-700">{log.previousStatus} {"->"} {log.nextStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
