import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { Link } from "react-router-dom";
import { fetchProducts } from "../lib/productsApi";
import { addToCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";

export default function HomePage() {
  const token = getAccessToken();
  const queryClient = useQueryClient();

  const highlights = [
    { title: "Server-backed Catalog", text: "Products now come from Express + PostgreSQL, not hardcoded HTML blocks." },
    { title: "Secure Accounts", text: "JWT auth with protected profile and cart endpoints is now active." },
    { title: "Tailwind UI System", text: "Reusable visual language across pages for a cleaner and more realistic storefront." }
  ];

  const categories = [
    { label: "Men", slug: "men" },
    { label: "Women", slug: "women" },
    { label: "Kids", slug: "kids" },
    { label: "Luxury", slug: "luxury" }
  ];

  const productsQuery = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: () => fetchProducts({ page: 1, limit: 24, sortBy: "createdAt", sortOrder: "desc" })
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const groupedProducts = useMemo(() => {
    const source = productsQuery.data?.items || [];

    return categories.map((category) => ({
      ...category,
      products: source.filter((item) => item.category?.slug === category.slug).slice(0, 2)
    }));
  }, [categories, productsQuery.data?.items]);

  return (
    <PageShell title="Crafted For Every Moment">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 p-6">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-amber-200/90">New Generation WatchMatrix</p>
          <h3 className="mb-3 mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
            From holiday static build to a full-stack commerce platform.
          </h3>
          <p className="m-0 max-w-2xl text-slate-300">
            We are now fully structured for scale with React, Node.js, and PostgreSQL. The next iterations will focus on richer
            product storytelling, checkout confidence, and production-grade polish.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                className="wm-btn-primary px-3 py-1 text-xs tracking-wide"
                key={category.slug}
                to={`/products?category=${category.slug}&page=1`}
              >
                {category.label}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link className="wm-btn-secondary inline-flex rounded-full px-4" to="/products?page=1">
              Browse All Watches
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/15 bg-slate-900/70 p-6">
          <p className="m-0 text-sm font-semibold text-white">Migration Progress</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            <li>Backend API and auth routes are running</li>
            <li>Database seeding for categories and products is active</li>
            <li>Products and cart pages are already connected</li>
          </ul>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5" key={item.title}>
            <h4 className="m-0 text-lg font-semibold text-white">{item.title}</h4>
            <p className="mb-0 mt-2 text-sm text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="m-0 text-2xl font-semibold text-white">Featured Categories</h3>
          <Link className="wm-btn-secondary rounded-full px-4" to="/products?page=1">View All Products</Link>
        </div>

        {productsQuery.isPending ? <p className="wm-muted">Loading featured products...</p> : null}
        {productsQuery.isError ? <p className="text-rose-300">Unable to load featured products.</p> : null}

        <div className="grid gap-5">
          {groupedProducts.map((group) => (
            <article className="wm-panel" key={group.slug}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="m-0 text-lg font-semibold text-white">{group.label}</h4>
                <Link className="wm-price text-sm font-semibold" to={`/products?category=${group.slug}&page=1`}>
                  Explore {group.label}
                </Link>
              </div>

              {group.products.length === 0 ? (
                <p className="wm-muted m-0 text-sm">No featured products yet for this category.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.products.map((product) => (
                    <div className="wm-card p-3" key={product.id}>
                      <Link to={`/products/${product.slug}`}>
                        <img className="h-40 w-full rounded-xl bg-slate-800 object-cover" src={product.imageUrl} alt={product.name} loading="lazy" />
                      </Link>
                      <h5 className="mb-1 mt-3 text-base font-semibold text-white">{product.name}</h5>
                      <p className="my-1 text-sm text-slate-400">{product.brand}</p>
                      <p className="wm-price mt-2 font-bold">Rs. {Number(product.price).toFixed(2)}</p>

                      {!token ? (
                        <Link className="wm-btn-secondary mt-3 inline-flex rounded-full px-4" to="/login">Login to Add</Link>
                      ) : (
                        <button
                          className="wm-btn-primary mt-3"
                          type="button"
                          onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
                          disabled={addMutation.isPending}
                        >
                          {addMutation.isPending ? "Adding..." : "Add To Cart"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
