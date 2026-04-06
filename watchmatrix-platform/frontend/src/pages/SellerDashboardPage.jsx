import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import {
  createSellerProduct,
  deleteSellerProduct,
  fetchSellerCategories,
  fetchSellerProducts,
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

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts
  });

  const categoriesQuery = useQuery({
    queryKey: ["seller-categories"],
    queryFn: fetchSellerCategories
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
    }
  });

  const stockMutation = useMutation({
    mutationFn: ({ productId, stock }) => updateSellerProduct(productId, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
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
    </PageShell>
  );
}
