import { useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { verifyEsewaPayment, verifyKhaltiPayment } from "../lib/paymentsApi";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const provider = (searchParams.get("provider") || "").toLowerCase();
  const pidx = searchParams.get("pidx") || "";
  const esewaData = searchParams.get("data") || "";

  const pending = useMemo(() => {
    const raw = sessionStorage.getItem("wm_pending_checkout");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!pending?.checkout) {
        throw new Error("Missing pending checkout details. Please place the order again.");
      }

      if (provider === "khalti") {
        return verifyKhaltiPayment(pidx, pending.checkout);
      }

      if (provider === "esewa") {
        return verifyEsewaPayment(esewaData, pending.checkout);
      }

      throw new Error("Unknown payment provider callback.");
    },
    onSuccess: (data) => {
      sessionStorage.removeItem("wm_pending_checkout");
      navigate(`/order-success?orderId=${data.order.id}`, { state: { order: data.order }, replace: true });
    }
  });

  useEffect(() => {
    verifyMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell title="Payment Verification">
      <section className="wm-panel p-6">
        <h3 className="m-0 text-2xl text-slate-900">Verifying Payment</h3>

        {verifyMutation.isPending ? (
          <p className="mt-3 text-sm text-slate-700">Please wait while we verify your payment and confirm your order.</p>
        ) : null}

        {verifyMutation.isError ? (
          <>
            <p className="mt-3 text-sm text-rose-700">
              {verifyMutation.error?.response?.data?.message || verifyMutation.error?.message || "Payment verification failed."}
            </p>
            <div className="mt-4 flex gap-3">
              <Link className="wm-btn-secondary" to="/checkout">Back to Checkout</Link>
              <Link className="wm-btn-primary" to="/profile">Go to Profile</Link>
            </div>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
