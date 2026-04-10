import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import CheckoutProgress from "../components/common/CheckoutProgress";
import { fetchCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";
import { fetchMe } from "../lib/authApi";
import { placeOrder } from "../lib/ordersApi";
import { initiateEsewaPayment, initiateKhaltiPayment } from "../lib/paymentsApi";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: "COD"
  });

  const cartQuery = useQuery({
    queryKey: ["cart", "checkout"],
    queryFn: fetchCart,
    enabled: Boolean(token)
  });

  const meQuery = useQuery({
    queryKey: ["me", "checkout"],
    queryFn: fetchMe,
    enabled: Boolean(token)
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      setSubmitError("");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart", "checkout"] });
      navigate(`/order-success?orderId=${order.id}`, { state: { order } });
    },
    onError: (error) => {
      setSubmitError(error?.response?.data?.message || "Could not place order");
    }
  });

  const initiateKhaltiMutation = useMutation({
    mutationFn: initiateKhaltiPayment,
    onSuccess: (data) => {
      sessionStorage.setItem("wm_pending_checkout", JSON.stringify({
        provider: "khalti",
        checkout: form,
        pidx: data.pidx,
        transactionRef: data.transactionRef
      }));

      window.location.href = data.paymentUrl;
    },
    onError: (error) => {
      setSubmitError(error?.response?.data?.message || "Could not start Khalti payment");
    }
  });

  const initiateEsewaMutation = useMutation({
    mutationFn: initiateEsewaPayment,
    onSuccess: (data) => {
      sessionStorage.setItem("wm_pending_checkout", JSON.stringify({
        provider: "esewa",
        checkout: form,
        transactionRef: data.transactionRef
      }));

      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = data.paymentUrl;

      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    },
    onError: (error) => {
      setSubmitError(error?.response?.data?.message || "Could not start eSewa payment");
    }
  });

  const cart = cartQuery.data;

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || meQuery.data.fullName || "",
      email: prev.email || meQuery.data.email || ""
    }));
  }, [meQuery.data]);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!cart || cart.items.length === 0) {
      setSubmitError("Your cart is empty");
      return;
    }

    if (form.paymentMethod === "COD") {
      placeOrderMutation.mutate(form);
      return;
    }

    if (form.paymentMethod === "KHALTI") {
      initiateKhaltiMutation.mutate(form);
      return;
    }

    if (form.paymentMethod === "ESEWA") {
      initiateEsewaMutation.mutate(form);
      return;
    }

    setSubmitError("Unsupported payment method selected.");
  }

  return (
    <PageShell title="Checkout">
      <CheckoutProgress currentStep={2} />

      {!token ? (
        <section className="wm-panel mb-4">
          <p className="m-0 text-slate-700">Please sign in to continue checkout.</p>
          <Link className="wm-btn-primary mt-3 inline-flex" to="/login">Go to Login</Link>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <form className="wm-panel p-5" onSubmit={onSubmit}>
          <h3 className="m-0 text-xl text-slate-900">Shipping & Contact</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="wm-input" name="fullName" placeholder="Full name" value={form.fullName} onChange={onChange} required />
            <input className="wm-input" name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} required />
            <input className="wm-input" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
            <input className="wm-input" name="city" placeholder="City" value={form.city} onChange={onChange} required />
            <input className="wm-input sm:col-span-2" name="addressLine1" placeholder="Address line 1" value={form.addressLine1} onChange={onChange} required />
            <input className="wm-input sm:col-span-2" name="addressLine2" placeholder="Address line 2 (optional)" value={form.addressLine2} onChange={onChange} />
            <input className="wm-input" name="postalCode" placeholder="Postal code" value={form.postalCode} onChange={onChange} required />
            <select className="wm-input" name="paymentMethod" value={form.paymentMethod} onChange={onChange}>
              <option value="COD">Cash On Delivery</option>
              <option value="KHALTI">Khalti</option>
              <option value="ESEWA">eSewa</option>
            </select>
            <textarea className="wm-input sm:col-span-2" name="notes" placeholder="Order note (optional)" rows={3} value={form.notes} onChange={onChange} />
          </div>

          {form.paymentMethod === "COD" ? (
            <p className="mb-0 mt-2 text-xs text-slate-600">Order will be confirmed immediately and paid by Cash On Delivery.</p>
          ) : null}
          {form.paymentMethod === "KHALTI" ? (
            <p className="mb-0 mt-2 text-xs text-slate-600">You will be redirected to Khalti secure checkout and returned here after payment.</p>
          ) : null}
          {form.paymentMethod === "ESEWA" ? (
            <p className="mb-0 mt-2 text-xs text-slate-600">You will be redirected to eSewa secure checkout and returned here after payment.</p>
          ) : null}

          {submitError ? <p className="mb-0 mt-3 text-sm text-rose-700">{submitError}</p> : null}

          <button
            className="wm-btn-primary mt-4"
            type="submit"
            disabled={!token || !cart || cart.items.length === 0 || placeOrderMutation.isPending || initiateKhaltiMutation.isPending || initiateEsewaMutation.isPending}
          >
            {placeOrderMutation.isPending ? "Placing Order..." : null}
            {initiateKhaltiMutation.isPending ? "Redirecting to Khalti..." : null}
            {initiateEsewaMutation.isPending ? "Redirecting to eSewa..." : null}
            {!placeOrderMutation.isPending && !initiateKhaltiMutation.isPending && !initiateEsewaMutation.isPending ? "Place Order" : null}
          </button>
        </form>

        <article className="wm-card p-5">
          <h3 className="m-0 text-xl text-slate-900">Order Preview</h3>
          {cartQuery.isPending ? <p className="mt-2 text-sm text-slate-600">Loading cart summary...</p> : null}
          {cartQuery.isError ? <p className="mt-2 text-sm text-rose-600">Could not load checkout summary.</p> : null}

          {cart ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
                {cart.items.map((item) => (
                  <div className="flex items-center justify-between gap-2" key={item.id}>
                    <p className="m-0 text-xs text-slate-700">{item.product.name} x {item.quantity}</p>
                    <p className="m-0 text-xs font-semibold text-slate-900">Rs. {item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <p className="m-0"><strong>Items:</strong> {cart.totals.totalItems}</p>
              <p className="m-0"><strong>Subtotal:</strong> <span className="wm-price">Rs. {cart.totals.totalAmount.toFixed(2)}</span></p>
              <p className="m-0"><strong>Shipping:</strong> Rs. 0.00</p>
              <p className="m-0 text-base font-semibold"><strong>Total:</strong> <span className="wm-price">Rs. {cart.totals.totalAmount.toFixed(2)}</span></p>
            </div>
          ) : (
            <ul className="mb-0 mt-2 grid gap-2 text-sm text-slate-600">
              <li>Subtotal and shipping breakdown</li>
              <li>Payment method selection</li>
              <li>Order placement confirmation</li>
            </ul>
          )}
        </article>
      </section>
    </PageShell>
  );
}
