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
      <form className="mb-4 grid max-w-[440px] gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4" onSubmit={onSubmit}>
        <label className="text-sm font-medium text-slate-200" htmlFor="email">Email</label>
        <input
          className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-200/60 focus:outline-none"
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label className="text-sm font-medium text-slate-200" htmlFor="password">Password</label>
        <input
          className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-200/60 focus:outline-none"
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="m-0 text-sm text-rose-300">{error}</p> : null}

        <button className="rounded-full border border-amber-200/50 bg-amber-200/10 px-4 py-2 font-medium text-amber-100 disabled:opacity-50" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate-300">
        Don&apos;t have an account? <Link className="font-semibold text-amber-200" to="/register">Create one</Link>
      </p>
    </PageShell>
  );
}
