import PageShell from "../components/common/PageShell";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "../lib/productsApi";
import { addToCart, clearCart, fetchCart, removeCartItem, updateCartItem } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";

export default function CartPage() {
  const queryClient = useQueryClient();
  const token = getAccessToken();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: Boolean(token)
  });

  const productsQuery = useQuery({
    queryKey: ["products", "cart-page"],
    queryFn: () => fetchProducts({ limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: Boolean(token)
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  if (!token) {
    return (
      <PageShell title="Cart">
        <p className="text-slate-300">You need to sign in to use your cart.</p>
        <p className="mt-3">
          <Link className="wm-btn-primary" to="/login">Go to Login</Link>
        </p>
      </PageShell>
    );
  }

  const cart = cartQuery.data;
  const recommended = productsQuery.data?.items || [];

  return (
    <PageShell title="Your Cart">
      {cartQuery.isPending ? <p className="text-slate-300">Loading cart...</p> : null}
      {cartQuery.isError ? <p className="text-rose-300">Unable to load cart.</p> : null}

      {cart ? (
        <>
          <div className="wm-panel mb-5 flex flex-wrap items-center gap-3">
            <p className="text-slate-200"><strong>Total items:</strong> {cart.totals.totalItems}</p>
            <p className="text-slate-200"><strong>Total amount:</strong> <span className="wm-price">Rs. {cart.totals.totalAmount.toFixed(2)}</span></p>
            <button
              className="wm-btn-secondary"
              type="button"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || cart.items.length === 0}
            >
              Clear Cart
            </button>
          </div>

          <section className="mb-5 grid gap-3">
            {cart.items.length === 0 ? <p className="wm-panel wm-muted">Your cart is empty.</p> : null}

            {cart.items.map((item) => (
              <article className="wm-card grid gap-3 p-3 sm:grid-cols-[120px_1fr]" key={item.id}>
                <img className="h-[110px] w-full rounded-xl bg-slate-800 object-cover" src={item.product.imageUrl} alt={item.product.name} loading="lazy" />
                <div>
                  <h3 className="mb-1 mt-0 text-base font-semibold text-white">{item.product.name}</h3>
                  <p className="my-1 text-sm text-slate-400">{item.product.brand}</p>
                  <p className="text-slate-200">Rs. {item.product.price.toFixed(2)}</p>
                  <p className="text-slate-300">Subtotal: <span className="wm-price">Rs. {item.subtotal.toFixed(2)}</span></p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="wm-btn-secondary px-3 py-1"
                      type="button"
                      onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="wm-btn-secondary px-3 py-1"
                      type="button"
                      onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={updateMutation.isPending}
                    >
                      +
                    </button>
                    <button
                      className="rounded-lg border border-rose-300/40 bg-rose-300/10 px-3 py-1 text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => removeMutation.mutate(item.id)}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <h3 className="mb-2 text-lg font-semibold text-white">Add More Products</h3>
          <section className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
            {recommended.map((product) => (
              <article className="wm-card p-3" key={product.id}>
                <img className="h-44 w-full rounded-xl bg-slate-800 object-cover" src={product.imageUrl} alt={product.name} loading="lazy" />
                <h3 className="mb-1 mt-3 text-base font-semibold text-white">{product.name}</h3>
                <p className="my-1 text-sm text-slate-400">{product.brand}</p>
                <p className="wm-price mt-2 font-bold">Rs. {product.price.toFixed(2)}</p>
                <button
                  className="wm-btn-primary mt-3 rounded-xl px-3"
                  type="button"
                  onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
                  disabled={addMutation.isPending}
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
