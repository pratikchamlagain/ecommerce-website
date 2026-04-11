import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { registerAdminUser } from "../lib/authApi";
import { setAccessToken, setAuthUser } from "../lib/authStorage";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    setupKey: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await registerAdminUser(form);
      setAccessToken(result.accessToken);
      setAuthUser(result.user);
      navigate("/admin", { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Admin setup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell title="Admin Setup">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="wm-auth-side">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Restricted Setup</p>
          <h3 className="mb-0 mt-2 text-3xl text-slate-900">Create first admin account</h3>
          <p className="mb-0 mt-3 text-sm text-slate-700">
            This page requires the server-side setup key. It is intended for initial platform ownership only,
            then regular admin access is done from the standard login page.
          </p>
          <ul className="mb-0 mt-4 grid gap-2 text-sm text-slate-700">
            <li>Set ADMIN_SETUP_KEY in backend environment first</li>
            <li>Use this page once to create the first admin</li>
            <li>Later, sign in as admin from normal login flow</li>
          </ul>
        </article>

        <form className="wm-panel grid gap-2 p-5" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-700" htmlFor="fullName">Full Name</label>
          <input
            className="wm-input"
            id="fullName"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="email">Admin Email</label>
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
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="setupKey">Setup Key</label>
          <input
            className="wm-input"
            id="setupKey"
            type="password"
            minLength={8}
            value={form.setupKey}
            onChange={(event) => setForm((prev) => ({ ...prev, setupKey: event.target.value }))}
            required
          />

          {error ? <p className="m-0 text-sm text-rose-600">{error}</p> : null}

          <button className="wm-btn-primary mt-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating admin..." : "Create Admin"}
          </button>

          <p className="m-0 mt-2 text-sm text-slate-600">
            Already have admin access? <Link className="font-semibold text-slate-900 underline" to="/login">Go to login</Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
