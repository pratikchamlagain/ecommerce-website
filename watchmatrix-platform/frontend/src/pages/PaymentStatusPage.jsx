import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { verifyEsewa, verifyKhalti } from "../lib/paymentsApi";

function storageKey(ref) {
  return `wm-payment-checkout-${ref}`;
}

function readCheckoutFromStorage(ref) {
  if (!ref) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(ref));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearCheckoutFromStorage(ref) {
  if (!ref) {
    return;
  }
  window.localStorage.removeItem(storageKey(ref));
}

export default function PaymentStatusPage() {
  const { provider: routeProvider = "" } = useParams();
  const [searchParams] = useSearchParams();
  const provider = routeProvider.toLowerCase();
  const ref = searchParams.get("ref") || "";
  const pidx = searchParams.get("pidx") || "";
  const esewaData = searchParams.get("data") || "";

  const checkout = useMemo(() => readCheckoutFromStorage(ref), [ref]);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!checkout) {
        throw new Error("Missing checkout context. Please retry payment from checkout.");
      }

      if (provider === "khalti") {
        if (!pidx) {
          throw new Error("Missing Khalti payment identifier.");
        }
        return verifyKhalti({ pidx, checkout, paymentRef: ref });
      }

      if (provider === "esewa") {
        if (!esewaData && !ref) {
          throw new Error("Missing eSewa callback reference.");
        }
        return verifyEsewa({ data: esewaData || undefined, checkout, paymentRef: ref || undefined });
      }

      throw new Error("Unsupported payment provider.");
    },
    onSuccess: () => {
      clearCheckoutFromStorage(ref);
    }
  });

  useEffect(() => {
    if (verifyMutation.isPending || verifyMutation.isSuccess) {
      return;
    }

    if (!provider || !checkout) {
      return;
    }

    if (provider === "khalti" && !pidx) {
      return;
    }

    if (provider === "esewa" && !esewaData && !ref) {
      return;
    }

    verifyMutation.mutate();
  }, [checkout, esewaData, pidx, provider, ref, verifyMutation]);

  return (
    <PageShell title="Payment Status">
      <section className="wm-panel p-5">
        <h3 className="m-0 text-2xl text-slate-900">Payment Verification</h3>
        <p className="m-0 mt-2 text-sm text-slate-600">Provider: {provider ? provider.toUpperCase() : "Unknown"}</p>

        {!verifyMutation.isPending && !verifyMutation.isSuccess ? (
          <button className="wm-btn-primary mt-4" type="button" onClick={() => verifyMutation.mutate()}>
            Verify Payment
          </button>
        ) : null}

        {verifyMutation.isPending ? <p className="mt-4 text-sm text-slate-700">Verifying payment, please wait...</p> : null}

        {verifyMutation.isError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {verifyMutation.error?.response?.data?.message || verifyMutation.error?.message || "Payment verification failed."}
          </div>
        ) : null}

        {verifyMutation.isSuccess ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="m-0 font-semibold">Payment verified and order placed successfully.</p>
            <p className="m-0 mt-2">Order ID: {verifyMutation.data.order?.id}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="wm-btn-secondary" to={`/orders/${verifyMutation.data.order?.id}`}>
                Track Order
              </Link>
              <Link className="wm-btn-primary" to="/profile">
                Go To Profile
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="wm-btn-secondary" to="/checkout">Back To Checkout</Link>
          <Link className="wm-btn-secondary" to="/payments">Payment History</Link>
        </div>
      </section>
    </PageShell>
  );
}
