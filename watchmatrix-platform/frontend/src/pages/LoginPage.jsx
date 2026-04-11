import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { loginUser } from "../lib/authApi";
import { setAccessToken, setAuthUser } from "../lib/authStorage";
import { getRoleHomePath } from "../lib/authRole";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fallbackPath = "/profile";
  const targetPath = location.state?.from?.pathname;

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser(form);
      setAccessToken(result.accessToken);
      setAuthUser(result.user);
      navigate(targetPath || getRoleHomePath(result.user?.role) || fallbackPath, { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell title="Welcome Back">
      <section className="wm-auth-layout">
        <article className="wm-auth-side">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Account Access</p>
          <h3 className="mb-0 mt-2 text-3xl text-slate-900">Sign in to continue shopping and managing orders</h3>
          <ul className="mb-0 mt-5 grid gap-2 text-sm text-slate-700">
            <li>Track current orders and payment records</li>
            <li>Continue support chats with seller or admin</li>
            <li>Manage cart, checkout details, and saved profile data</li>
          </ul>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-3">
            <p className="m-0 text-sm font-semibold text-slate-900">Need first admin access?</p>
            <p className="m-0 mt-1 text-xs text-slate-600">
              Use the protected admin setup flow once with your backend setup key.
            </p>
            <Link className="wm-btn-secondary mt-3 inline-flex text-xs" to="/admin/setup">Open Admin Setup</Link>
          </div>
        </article>

        <form className="wm-panel grid gap-2 p-5" onSubmit={onSubmit}>
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
            required
          />

          {error ? <p className="m-0 text-sm text-rose-600">{error}</p> : null}

          <button className="wm-btn-primary mt-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="m-0 mt-2 text-sm text-slate-600">
            Don&apos;t have an account? <Link className="font-semibold text-slate-900 underline" to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
