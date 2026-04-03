import { Link } from "react-router-dom";

export default function PageShell({ title, children }) {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3 text-slate-200">
        <h1 className="m-0 text-lg font-semibold">WatchMatrix</h1>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link className="hover:text-white" to="/">Home</Link>
          <Link className="hover:text-white" to="/products">Products</Link>
          <Link className="hover:text-white" to="/cart">Cart</Link>
          <Link className="hover:text-white" to="/checkout">Checkout</Link>
          <Link className="hover:text-white" to="/about">About</Link>
          <Link className="hover:text-white" to="/login">Login</Link>
          <Link className="hover:text-white" to="/register">Register</Link>
          <Link className="hover:text-white" to="/profile">Profile</Link>
        </nav>
      </header>

      <main className="mx-auto my-5 w-[min(1000px,95%)] rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mt-0 text-2xl font-semibold text-slate-900">{title}</h2>
        {children}
      </main>
    </div>
  );
}
