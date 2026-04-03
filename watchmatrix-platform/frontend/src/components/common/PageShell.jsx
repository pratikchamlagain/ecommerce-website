import { Link } from "react-router-dom";

export default function PageShell({ title, children }) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <h1>WatchMatrix</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main>
        <h2>{title}</h2>
        {children}
      </main>
    </div>
  );
}
