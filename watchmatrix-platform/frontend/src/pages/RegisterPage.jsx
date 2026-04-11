import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { registerUser } from "../lib/authApi";
import { setAccessToken, setAuthUser } from "../lib/authStorage";
import { getRoleHomePath } from "../lib/authRole";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    sellerProfile: {
      businessName: "",
      businessType: "",
      businessAddress: "",
      panOrVat: "",
      phone: "",
      yearsInBusiness: "",
      monthlyOrderVolume: "",
      websiteUrl: ""
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role
      };

      if (form.role === "SELLER") {
        payload.sellerProfile = {
          businessName: form.sellerProfile.businessName,
          businessType: form.sellerProfile.businessType,
          businessAddress: form.sellerProfile.businessAddress,
          panOrVat: form.sellerProfile.panOrVat,
          phone: form.sellerProfile.phone,
          yearsInBusiness: form.sellerProfile.yearsInBusiness ? Number(form.sellerProfile.yearsInBusiness) : undefined,
          monthlyOrderVolume: form.sellerProfile.monthlyOrderVolume,
          websiteUrl: form.sellerProfile.websiteUrl
        };
      }

      const result = await registerUser(payload);
      setAccessToken(result.accessToken);
      setAuthUser(result.user);
      navigate(getRoleHomePath(result.user?.role), { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell title="Create Your Account">
      <section className="wm-auth-layout">
        <article className="wm-auth-side">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Join WatchMatrix</p>
          <h3 className="mb-0 mt-2 text-3xl text-slate-900">Start buying or selling with a verified account</h3>
          <ul className="mb-0 mt-5 grid gap-2 text-sm text-slate-700">
            <li>Customer accounts can shop, pay, track, and chat with sellers</li>
            <li>Seller accounts can list products and manage fulfillment</li>
            <li>Admin support is available through escalation-enabled chat</li>
          </ul>
        </article>

        <form className="wm-panel grid gap-2 p-5" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-700" htmlFor="fullName">Full Name</label>
          <input
            className="wm-input"
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
          <input
            className="wm-input"
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
          <input
            className="wm-input"
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            minLength={6}
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="role">Account Type</label>
          <select
            className="wm-input"
            id="role"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
          </select>

          {form.role === "SELLER" ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-sm font-semibold text-slate-900">Seller Business Details</p>
              <p className="m-0 mt-1 text-xs text-slate-600">Required for a professional storefront onboarding.</p>

              <div className="mt-2 grid gap-2">
                <input
                  className="wm-input"
                  placeholder="Business name"
                  value={form.sellerProfile.businessName}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    sellerProfile: {
                      ...prev.sellerProfile,
                      businessName: event.target.value
                    }
                  }))}
                  required={form.role === "SELLER"}
                />
                <input
                  className="wm-input"
                  placeholder="Business type (Retail, Distributor, Boutique...)"
                  value={form.sellerProfile.businessType}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    sellerProfile: {
                      ...prev.sellerProfile,
                      businessType: event.target.value
                    }
                  }))}
                  required={form.role === "SELLER"}
                />
                <input
                  className="wm-input"
                  placeholder="Business address"
                  value={form.sellerProfile.businessAddress}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    sellerProfile: {
                      ...prev.sellerProfile,
                      businessAddress: event.target.value
                    }
                  }))}
                  required={form.role === "SELLER"}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="wm-input"
                    placeholder="PAN / VAT"
                    value={form.sellerProfile.panOrVat}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      sellerProfile: {
                        ...prev.sellerProfile,
                        panOrVat: event.target.value
                      }
                    }))}
                    required={form.role === "SELLER"}
                  />
                  <input
                    className="wm-input"
                    placeholder="Business phone"
                    value={form.sellerProfile.phone}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      sellerProfile: {
                        ...prev.sellerProfile,
                        phone: event.target.value
                      }
                    }))}
                    required={form.role === "SELLER"}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="wm-input"
                    min="0"
                    placeholder="Years in business"
                    type="number"
                    value={form.sellerProfile.yearsInBusiness}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      sellerProfile: {
                        ...prev.sellerProfile,
                        yearsInBusiness: event.target.value
                      }
                    }))}
                  />
                  <input
                    className="wm-input"
                    placeholder="Monthly orders (e.g. 50-100)"
                    value={form.sellerProfile.monthlyOrderVolume}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      sellerProfile: {
                        ...prev.sellerProfile,
                        monthlyOrderVolume: event.target.value
                      }
                    }))}
                  />
                </div>
                <input
                  className="wm-input"
                  placeholder="Website URL (optional)"
                  type="url"
                  value={form.sellerProfile.websiteUrl}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    sellerProfile: {
                      ...prev.sellerProfile,
                      websiteUrl: event.target.value
                    }
                  }))}
                />
              </div>
            </div>
          ) : (
            <p className="m-0 mt-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Customer signup is intentionally simple: basic account details only.
            </p>
          )}

          {error ? <p className="m-0 text-sm text-rose-600">{error}</p> : null}

          <button className="wm-btn-primary mt-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="m-0 mt-2 text-sm text-slate-600">
            Already have an account? <Link className="font-semibold text-slate-900 underline" to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
