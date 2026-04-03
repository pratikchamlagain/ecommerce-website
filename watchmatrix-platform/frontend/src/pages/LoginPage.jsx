import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { loginUser } from "../lib/authApi";
import { setAccessToken } from "../lib/authStorage";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const targetPath = location.state?.from?.pathname || "/profile";

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser(form);
      setAccessToken(result.accessToken);
      navigate(targetPath, { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell title="Login">
      <form className="mb-4 grid max-w-[420px] gap-2" onSubmit={onSubmit}>
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="m-0 text-sm text-red-700">{error}</p> : null}

        <button className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Don&apos;t have an account? <Link className="font-semibold text-slate-900" to="/register">Create one</Link>
      </p>
    </PageShell>
  );
}
