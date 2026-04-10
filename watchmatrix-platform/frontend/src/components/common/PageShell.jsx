import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink } from "react-router-dom";
import { fetchMyConversations } from "../../lib/chatApi";
import { getAccessToken, getAuthUser } from "../../lib/authStorage";

export default function PageShell({ title, children }) {
  const token = getAccessToken();
  const authUser = getAuthUser();

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

  const quickLinks = [
    { to: "/about", label: "Contact Us" },
    { to: "/products?category=luxury&page=1", label: "Luxury Watches" },
    { to: "/checkout", label: "Sell My Watch" }
  ];

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
    { to: "/checkout", label: "Checkout" },
    { to: "/payments", label: "Payments" },
    { to: "/about", label: "About" },
    { to: "/chat", label: "Chat" },
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/profile", label: "Profile" }
  ];

  if (authUser?.role === "ADMIN") {
    navItems.splice(5, 0, { to: "/admin/payments", label: "Admin Payments" });
  }

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
    <div className="min-h-screen bg-[#f2f2f2] text-slate-900">
      <header className="border-b border-black/10 bg-black text-white">
        <p className="m-0 py-2 text-center text-sm font-medium tracking-wide">100% Certified Authentic</p>
      </header>

      <div className="border-b border-black/10 bg-white">
        <div className="mx-auto flex w-[min(1320px,95%)] flex-wrap items-center justify-between gap-3 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            {quickLinks.map((item) => (
              <Link className="hover:text-black" key={item.to} to={item.to}>{item.label}</Link>
            ))}
          </nav>

          <Link className="text-5xl font-black tracking-[0.08em] text-black" to="/">WM</Link>

          <div className="flex flex-wrap items-center gap-2">
            <input className="wm-input w-[220px] rounded-full" placeholder="Search watches" type="search" />
            <Link className="wm-icon-btn" to="/cart">Bag</Link>
            <Link className="wm-icon-btn" to="/profile">Account</Link>
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
        <nav className="mx-auto flex w-[min(1320px,95%)] flex-wrap gap-2 py-2 text-sm">
          {navItems.map((item) => (
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
      </div>

      <main className="pb-12 pt-6">
        <section className="mx-auto w-[min(1320px,95%)]">
          <h2 className="wm-page-title">{title}</h2>
          <div className="mt-4">{children}</div>
        </section>
      </main>

      <footer className="bg-[#2f3238] py-10 text-slate-100">
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
