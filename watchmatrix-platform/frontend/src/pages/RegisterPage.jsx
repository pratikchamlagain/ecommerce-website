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
    <PageShell title="Register">
      <form className="wm-panel mb-4 grid max-w-[440px] gap-2" onSubmit={onSubmit}>
        <label className="text-sm font-medium text-slate-200" htmlFor="fullName">Full Name</label>
        <input
          className="wm-input"
          id="fullName"
          type="text"
          value={form.fullName}
          onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          required
        />

        <label className="text-sm font-medium text-slate-200" htmlFor="email">Email</label>
        <input
          className="wm-input"
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label className="text-sm font-medium text-slate-200" htmlFor="password">Password</label>
        <input
          className="wm-input"
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          minLength={6}
          required
        />

        <label className="text-sm font-medium text-slate-200" htmlFor="role">Account Type</label>
        <select
          className="wm-input"
          id="role"
          value={form.role}
          onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
        </select>

        {error ? <p className="m-0 text-sm text-rose-300">{error}</p> : null}

        <button className="wm-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-slate-300">
        Already have an account? <Link className="font-semibold wm-price" to="/login">Sign in</Link>
      </p>
    </PageShell>
  );
}
