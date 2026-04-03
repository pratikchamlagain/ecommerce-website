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
        <p>You need to sign in to use your cart.</p>
        <p>
          <Link to="/login">Go to Login</Link>
        </p>
      </PageShell>
    );
  }

  const cart = cartQuery.data;
  const recommended = productsQuery.data?.items || [];

  return (
    <PageShell title="Cart">
      {cartQuery.isPending ? <p>Loading cart...</p> : null}
      {cartQuery.isError ? <p>Unable to load cart.</p> : null}

      {cart ? (
        <>
          <div className="cart-summary">
            <p><strong>Total items:</strong> {cart.totals.totalItems}</p>
            <p><strong>Total amount:</strong> Rs. {cart.totals.totalAmount.toFixed(2)}</p>
            <button
              type="button"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || cart.items.length === 0}
            >
              Clear Cart
            </button>
          </div>

          <section className="cart-list">
            {cart.items.length === 0 ? <p>Your cart is empty.</p> : null}

            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.product.imageUrl} alt={item.product.name} loading="lazy" />
                <div>
                  <h3>{item.product.name}</h3>
                  <p className="muted">{item.product.brand}</p>
                  <p>Rs. {item.product.price.toFixed(2)}</p>
                  <p>Subtotal: Rs. {item.subtotal.toFixed(2)}</p>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={updateMutation.isPending}
                    >
                      +
                    </button>
                    <button
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

          <h3>Add More Products</h3>
          <section className="products-grid">
            {recommended.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
                <h3>{product.name}</h3>
                <p className="muted">{product.brand}</p>
                <p className="price">Rs. {product.price.toFixed(2)}</p>
                <button
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
