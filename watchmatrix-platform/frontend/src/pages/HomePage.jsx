import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { Link } from "react-router-dom";
import { fetchProducts } from "../lib/productsApi";
import { addToCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";
import { getBrandLegacyImage, getCategoryLegacyGallery, getCategoryLegacyImage } from "../lib/legacyImageMap";

export default function HomePage() {
  const token = getAccessToken();
  const queryClient = useQueryClient();
  const [secondsLeft, setSecondsLeft] = useState(8 * 60 * 60 + 42 * 60 + 15);

  const highlights = [
    { title: "Voucher Vault", text: "Unlock daily voucher drops and checkout savings on selected models.", cta: "Collect Now" },
    { title: "Flash Deals", text: "Limited-time prices inspired by Daraz-style urgency campaigns.", cta: "Shop Flash" },
    { title: "Free Delivery", text: "Free insured shipping on premium orders above Rs. 25,000.", cta: "Learn More" }
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
      products: source.filter((item) => item.category?.slug === category.slug).slice(0, 6)
    }));
  }, [categories, productsQuery.data?.items]);

  const flashDeals = (productsQuery.data?.items || []).slice(0, 4);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 10 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  function formatCountdown(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  function onProductImageError(event, product) {
    const element = event.currentTarget;

    if (element.dataset.fallbackApplied === "1") {
      return;
    }

    const fallback = getBrandLegacyImage(product?.brand) || getCategoryLegacyImage(product?.category?.slug);

    if (!fallback) {
      return;
    }

    element.dataset.fallbackApplied = "1";
    element.src = fallback;
  }

  return (
    <PageShell title="Crafted For Every Moment">
      <section className="wm-reveal relative overflow-hidden rounded-3xl border border-black/20 bg-slate-900 text-white" style={{ animationDelay: "0.05s" }}>
        <img
          alt="Luxury watch hero"
          className="wm-hero-image h-[520px] w-full object-cover opacity-55"
          src={getCategoryLegacyImage("luxury")}
        />
        <div className="wm-hero-overlay absolute inset-0" />

        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <div className="max-w-2xl">
            <p className="m-0 text-sm uppercase tracking-[0.22em] text-slate-100">Pre-owned premium collection</p>
            <h3 className="mb-3 mt-3 text-5xl leading-tight text-white md:text-6xl">Rolex Watches</h3>
            <p className="m-0 text-slate-200">
              A marketplace-focused luxury experience inspired by premium watch leaders and optimized with modern conversion patterns.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="wm-btn-primary" to="/products?category=luxury&page=1">Buy a Watch</Link>
              <Link className="wm-btn-secondary border-white/40 bg-white/10 text-white" to="/checkout">Sell a Watch</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {highlights.map((item, index) => (
          <article className="wm-card wm-reveal p-5" key={item.title} style={{ animationDelay: `${0.1 + index * 0.08}s` }}>
            <h4 className="m-0 text-xl text-slate-900">{item.title}</h4>
            <p className="mb-0 mt-2 text-sm text-slate-600">{item.text}</p>
            <button className="wm-btn-secondary mt-4" type="button">{item.cta}</button>
          </article>
        ))}
      </section>

      <section className="wm-reveal mt-5 rounded-2xl border border-black/15 bg-white p-4" style={{ animationDelay: "0.22s" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Daraz-inspired feature</p>
            <h4 className="m-0 mt-1 text-2xl text-slate-900">Flash Deals</h4>
          </div>
          <p className="m-0 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
            Ends in {formatCountdown(secondsLeft)}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {flashDeals.map((product) => {
            const basePrice = Number(product.price);
            const offerPrice = Number((basePrice * 0.88).toFixed(2));

            return (
              <article className="wm-card overflow-hidden p-3" key={`flash-${product.id}`}>
                <Link className="wm-image-frame block h-48" to={`/products/${product.slug}`}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => onProductImageError(event, product)}
                  />
                </Link>
                <p className="mb-1 mt-3 text-sm text-slate-500">{product.brand}</p>
                <h5 className="m-0 text-base font-semibold text-slate-900">{product.name}</h5>
                <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">Flash Price</p>
                <p className="mt-2 text-lg font-bold text-rose-700">Rs. {offerPrice.toFixed(2)}</p>
                <p className="m-0 text-sm text-slate-500 line-through">Rs. {basePrice.toFixed(2)}</p>
              </article>
            );
          })}
          {flashDeals.length === 0 ? (
            <div className="wm-card md:col-span-2 xl:col-span-4 p-4 text-sm text-slate-600">
              Flash deals will appear here when new products are available.
            </div>
          ) : null}
        </div>
      </section>

      <section className="wm-reveal mt-5 rounded-2xl border border-black/15 bg-white p-4" style={{ animationDelay: "0.28s" }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="m-0 text-2xl text-slate-900">Category Visual Gallery</h4>
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Preview without opening product pages</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <article className="wm-card p-3" key={`gallery-${category.slug}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="m-0 text-lg font-semibold text-slate-900">{category.label}</p>
                <Link className="text-sm font-semibold text-slate-700 hover:underline" to={`/products?category=${category.slug}&page=1`}>
                  Browse
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(getCategoryLegacyGallery(category.slug).slice(0, 4).length > 0
                  ? getCategoryLegacyGallery(category.slug).slice(0, 4)
                  : [getCategoryLegacyImage(category.slug)]).map((image, index) => (
                  <div className="wm-image-frame h-24" key={`${category.slug}-${index}`}>
                    <img
                      src={image}
                      alt={`${category.label} watch ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wm-reveal mt-8" style={{ animationDelay: "0.34s" }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="m-0 text-3xl text-slate-900">Featured Categories</h3>
          <Link className="wm-btn-secondary rounded-full px-4" to="/products?page=1">View All Products</Link>
        </div>

        {productsQuery.isPending ? <p className="wm-muted">Loading featured products...</p> : null}
        {productsQuery.isError ? <p className="text-rose-300">Unable to load featured products.</p> : null}

        <div className="grid gap-5">
          {groupedProducts.map((group) => (
            <article className="wm-panel" key={group.slug}>
              <Link to={`/products?category=${group.slug}&page=1`}>
                <img
                  className="mb-3 h-44 w-full rounded-2xl object-cover"
                  src={getCategoryLegacyImage(group.slug)}
                  alt={`${group.label} category`}
                  loading="lazy"
                />
              </Link>

              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="m-0 text-2xl text-slate-900">{group.label}</h4>
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
                        <div className="wm-image-frame h-40">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(event) => onProductImageError(event, product)}
                          />
                        </div>
                      </Link>
                      <h5 className="mb-1 mt-3 text-base font-semibold text-slate-900">{product.name}</h5>
                      <p className="my-1 text-sm text-slate-500">{product.brand}</p>
                      <p className="wm-price mt-2 text-lg">Rs. {Number(product.price).toFixed(2)}</p>

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
