import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { registerUser } from "../lib/authApi";
import { setAccessToken, setAuthUser } from "../lib/authStorage";
import { getRoleHomePath } from "../lib/authRole";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "CUSTOMER" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await registerUser(form);
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
