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
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p>
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </PageShell>
  );
}
