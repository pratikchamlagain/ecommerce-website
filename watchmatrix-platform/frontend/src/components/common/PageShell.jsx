import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { fetchMyConversations } from "../../lib/chatApi";
import { clearAuthSession, getAccessToken, getAuthUser } from "../../lib/authStorage";

export default function PageShell({ title, children }) {
  const navigate = useNavigate();
  const token = getAccessToken();
  const authUser = getAuthUser();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chatConversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: fetchMyConversations,
    enabled: Boolean(token && authUser)
  });

  const chatUnreadCount = (chatConversationsQuery.data || []).reduce(
    (sum, conversation) => sum + (conversation.unreadCount || 0),
    0
  );

  const themes = [
    { id: "luxury-gold", label: "Luxury Gold" },
    { id: "ocean-steel", label: "Ocean Steel" },
    { id: "graphite-red", label: "Graphite Red" }
  ];

  const primaryNav = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/cart", label: "Cart" },
    { to: "/checkout", label: "Checkout" }
  ];

  const supportNav = [
    { to: "/payments", label: "Payments" },
    { to: "/chat", label: "Chat" },
    { to: "/about", label: "About" }
  ];

  const accountNav = token
    ? [
      { to: "/profile", label: "Profile" },
      ...(authUser?.role === "SELLER" ? [{ to: "/seller", label: "Seller" }] : []),
      ...(authUser?.role === "ADMIN" ? [{ to: "/admin", label: "Admin" }, { to: "/admin/payments", label: "Admin Payments" }] : [])
    ]
    : [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" }
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [token]);

  function onSearchSubmit(event) {
    event.preventDefault();
    const keyword = search.trim();
    navigate(keyword ? `/products?search=${encodeURIComponent(keyword)}&page=1` : "/products?page=1");
  }

  function onLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen text-slate-900">
      <header className="border-b border-black/10 bg-[#111317] text-white">
        <p className="m-0 py-2 text-center text-xs font-medium uppercase tracking-[0.2em]">Authenticated Luxury Watch Marketplace</p>
      </header>

      <div className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto grid w-[min(1320px,95%)] gap-3 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center justify-between gap-3">
            <Link className="text-4xl font-black tracking-[0.18em] text-slate-900" to="/">WM</Link>
            <button
              className="wm-btn-secondary px-3 py-1.5 text-xs md:hidden"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>

          <form className="flex gap-2" onSubmit={onSearchSubmit}>
            <input
              className="wm-input w-full"
              placeholder="Search by brand, model, or category"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="wm-btn-primary" type="submit">Search</button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Link className="wm-icon-btn" to="/products?category=luxury&page=1">Luxury</Link>
            <Link className="wm-icon-btn" to="/checkout">Sell</Link>
            <Link className="wm-icon-btn" to="/cart">Bag</Link>
            <select
              className="wm-input rounded-full px-3 py-2 text-xs"
              id="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {themes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-black/10 bg-white">
        <div className="mx-auto grid w-[min(1320px,95%)] gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {primaryNav.map((item) => (
              <NavLink
                className={({ isActive }) => (isActive ? "wm-nav-link wm-nav-link-active" : "wm-nav-link")}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            {supportNav.map((item) => (
              <NavLink
                className={({ isActive }) => (isActive ? "wm-nav-link wm-nav-link-active" : "wm-nav-link")}
                key={item.to}
                to={item.to}
              >
                <span className="inline-flex items-center gap-1">
                  {item.label}
                  {item.to === "/chat" && chatUnreadCount > 0 ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  ) : null}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            {accountNav.map((item) => (
              <NavLink
                className={({ isActive }) => (isActive ? "wm-nav-link wm-nav-link-active" : "wm-nav-link")}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            {token ? (
              <button className="wm-btn-secondary px-3 py-1.5 text-sm" type="button" onClick={onLogout}>Logout</button>
            ) : null}
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="wm-mobile-sheet">
            <div className="wm-mobile-nav-grid">
              {[...primaryNav, ...supportNav, ...accountNav].map((item) => (
                <NavLink
                  className={({ isActive }) => (isActive ? "wm-nav-link wm-nav-link-active" : "wm-nav-link")}
                  key={`mobile-${item.to}`}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            {token ? (
              <button className="wm-btn-secondary mt-2 w-full" type="button" onClick={onLogout}>Logout</button>
            ) : null}
          </div>
        ) : null}
      </div>

      <main className="pb-12 pt-6">
        <section className="mx-auto w-[min(1320px,95%)]">
          <h2 className="wm-page-title">{title}</h2>
          <div className="mt-4">{children}</div>
        </section>
      </main>

      <footer className="bg-[#1b1e24] py-10 text-slate-100">
        <div className="mx-auto grid w-[min(1320px,95%)] gap-6 text-sm md:grid-cols-4">
          <div>
            <p className="mb-2 text-lg font-semibold">WatchMatrix HQ</p>
            <p className="m-0">Kathmandu, Nepal</p>
            <p className="m-0">Mon-Sat, 9AM - 6PM</p>
          </div>
          <div>
            <p className="mb-2 text-lg font-semibold">Buying & Selling</p>
            <p className="m-0">Buy Premium Watches</p>
            <p className="m-0">Sell Your Watch</p>
            <p className="m-0">Authenticity Protection</p>
          </div>
          <div>
            <p className="mb-2 text-lg font-semibold">Support</p>
            <p className="m-0">Contact Us</p>
            <p className="m-0">FAQ</p>
            <p className="m-0">Returns</p>
          </div>
          <div>
            <p className="mb-2 text-lg font-semibold">Newsletter</p>
            <div className="flex gap-2">
              <input className="wm-input h-10 flex-1 border-white/20 bg-white/10 text-white placeholder:text-slate-300" placeholder="Your email" type="email" />
              <button className="wm-btn-primary h-10 rounded-full px-4" type="button">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
