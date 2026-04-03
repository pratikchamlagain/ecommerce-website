import { Link } from "react-router-dom";

export default function PageShell({ title, children }) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-[min(1200px,94%)] flex-wrap items-center justify-between gap-4 py-4">
          <Link className="group inline-flex items-center gap-3" to="/">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/50 bg-amber-200/10 text-sm font-bold text-amber-200">
              WM
            </span>
            <div>
              <p className="m-0 text-xs uppercase tracking-[0.2em] text-amber-200/80">WatchMatrix</p>
              <p className="m-0 text-sm text-slate-300 group-hover:text-white">Premium Timepieces</p>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 transition hover:border-amber-200/50 hover:text-amber-100"
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
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[22rem] w-[min(1100px,92%)] rounded-full bg-amber-300/10 blur-3xl" />
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
