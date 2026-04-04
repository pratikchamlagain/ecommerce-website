import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchProductBySlug } from "../lib/productsApi";
import { addToCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const queryClient = useQueryClient();
  const token = getAccessToken();

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug)
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const product = productQuery.data;

  return (
    <PageShell title="Product Detail">
      <Link className="wm-btn-secondary inline-flex rounded-full px-4" to="/products">
        Back to Products
      </Link>

      {productQuery.isPending ? <p className="mt-4 wm-muted">Loading product...</p> : null}
      {productQuery.isError ? <p className="mt-4 text-rose-300">Unable to load product details.</p> : null}

      {product ? (
        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="wm-card p-4">
            <img className="h-[380px] w-full rounded-2xl bg-slate-800 object-cover" src={product.imageUrl} alt={product.name} />
          </article>

          <article className="wm-panel">
            <p className="m-0 text-sm uppercase tracking-[0.18em] text-slate-400">{product.category?.name}</p>
            <h3 className="mb-2 mt-2 text-3xl font-semibold text-white">{product.name}</h3>
            <p className="my-0 text-slate-300">{product.description}</p>

            <div className="mt-4 grid gap-1 text-sm text-slate-300">
              <p className="m-0"><strong>Brand:</strong> {product.brand}</p>
              <p className="m-0"><strong>Stock:</strong> {product.stock}</p>
              <p className="m-0 text-lg font-bold wm-price">Rs. {Number(product.price).toFixed(2)}</p>
            </div>

            {!token ? (
              <p className="mt-5 text-sm text-slate-300">
                Please <Link className="wm-price font-semibold" to="/login">sign in</Link> to add this item to your cart.
              </p>
            ) : (
              <button
                className="wm-btn-primary mt-5"
                type="button"
                onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "Adding..." : "Add To Cart"}
              </button>
            )}
          </article>
        </section>
      ) : null}
    </PageShell>
  );
}
