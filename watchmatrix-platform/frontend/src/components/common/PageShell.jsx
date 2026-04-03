import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PageShell({ title, children }) {
  const themes = [
    { id: "luxury-gold", label: "Luxury Gold" },
    { id: "ocean-steel", label: "Ocean Steel" },
    { id: "graphite-red", label: "Graphite Red" }
  ];

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
    { to: "/checkout", label: "Checkout" },
    { to: "/about", label: "About" },
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/profile", label: "Profile" }
  ];

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "luxury-gold";
    }

    return window.localStorage.getItem("wm-theme") || "luxury-gold";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("wm-theme", theme);
  }, [theme]);

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundImage: "linear-gradient(to bottom, var(--wm-bg-from), var(--wm-bg-via), var(--wm-bg-to))"
      }}
    >
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-[min(1200px,94%)] flex-wrap items-center justify-between gap-4 py-4">
          <Link className="group inline-flex items-center gap-3" to="/">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold"
              style={{
                borderColor: "var(--wm-accent-border)",
                backgroundColor: "var(--wm-accent-soft)",
                color: "var(--wm-accent)"
              }}
            >
              WM
            </span>
            <div>
              <p className="m-0 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--wm-accent)" }}>WatchMatrix</p>
              <p className="m-0 text-sm text-slate-300 group-hover:text-white">Premium Timepieces</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-[0.14em] text-slate-400" htmlFor="theme-select">Theme</label>
            <select
              className="wm-input rounded-full px-3 py-1.5 text-sm"
              id="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {themes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                className="wm-nav-link"
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative isolate pb-10 pt-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[22rem] w-[min(1100px,92%)] rounded-full blur-3xl"
          style={{ background: "var(--wm-highlight)" }}
        />
        <section className="mx-auto w-[min(1200px,94%)] rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 md:p-8">
          <h2 className="mt-0 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
          <div className="mt-5 text-slate-200">{children}</div>
        </section>
      </main>

      <footer className="mx-auto w-[min(1200px,94%)] border-t border-white/10 py-6 text-xs text-slate-400">
        Curated watches for work, adventure, and legacy moments.
      </footer>
    </div>
  );
}
