import PageShell from "../components/common/PageShell";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/productsApi";
import { getBrandLegacyImage, getCategoryLegacyGallery, getCategoryLegacyImage } from "../lib/legacyImageMap";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const quickCategories = ["", "men", "women", "kids", "luxury"];

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setSortBy(searchParams.get("sortBy") || "createdAt");
    setSortOrder(searchParams.get("sortOrder") || "desc");
    setPage(Number(searchParams.get("page") || 1));
  }, [searchParams]);

  function applyFilters(next) {
    const merged = {
      search,
      category,
      sortBy,
      sortOrder,
      page,
      ...next
    };

    const params = new URLSearchParams();

    if (merged.search?.trim()) {
      params.set("search", merged.search.trim());
    }

    if (merged.category?.trim()) {
      params.set("category", merged.category.trim());
    }

    if (merged.sortBy && merged.sortBy !== "createdAt") {
      params.set("sortBy", merged.sortBy);
    }

    if (merged.sortOrder && merged.sortOrder !== "desc") {
      params.set("sortOrder", merged.sortOrder);
    }

    params.set("page", String(Math.max(1, Number(merged.page) || 1)));
    setSearchParams(params);
  }

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 8,
      sortBy,
      sortOrder
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (category.trim()) {
      params.category = category.trim();
    }

    return params;
  }, [category, page, search, sortBy, sortOrder]);

  const productsQuery = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => fetchProducts(queryParams)
  });

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;
  const selectedCategoryGallery = category ? getCategoryLegacyGallery(category) : [];

  function onSearchSubmit(event) {
    event.preventDefault();
    applyFilters({ page: 1, search, category, sortBy, sortOrder });
  }

  function resolveProductImage(product) {
    const fromApi = product?.imageUrl;

    if (typeof fromApi === "string" && fromApi.trim()) {
      return fromApi;
    }

    return getBrandLegacyImage(product?.brand) || getCategoryLegacyImage(product?.category?.slug);
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
    <PageShell title="Explore Collection">
      <section className="wm-panel mb-4 flex flex-wrap items-center gap-2">
        {quickCategories.map((cat) => {
          const label = cat ? cat[0].toUpperCase() + cat.slice(1) : "All";
          const isActive = category === cat;

          return (
            <button
              className={isActive ? "wm-btn-primary px-3 py-1 text-xs" : "wm-btn-secondary px-3 py-1 text-xs"}
              key={cat || "all"}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
                applyFilters({ category: cat, page: 1 });
              }}
            >
              {label}
            </button>
          );
        })}
      </section>

      <form className="wm-panel mb-5 grid grid-cols-1 gap-2 p-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={onSearchSubmit}>
        <input
          className="wm-input"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, brand, or description"
        />
        <input
          className="wm-input"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category slug (e.g. men, women)"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            className="wm-input"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              applyFilters({ sortBy: event.target.value, page: 1 });
            }}
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>

          <select
            className="wm-input"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value);
              applyFilters({ sortOrder: event.target.value, page: 1 });
            }}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button className="wm-btn-primary rounded-xl" type="submit">Apply</button>
          <button
            className="wm-btn-secondary"
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("");
              setSortBy("createdAt");
              setSortOrder("desc");
              setPage(1);
              setSearchParams(new URLSearchParams({ page: "1" }));
            }}
          >
            Clear Filters
          </button>
        </div>
      </form>

      {productsQuery.isPending ? <p className="text-slate-600">Loading products...</p> : null}
      {productsQuery.isError ? <p className="text-rose-600">Failed to load products.</p> : null}

      {!productsQuery.isPending && !productsQuery.isError && products.length === 0 ? (
        <p className="wm-panel wm-muted">No products found yet. Add data or adjust filters.</p>
      ) : null}

      {category && selectedCategoryGallery.length > 0 ? (
        <section className="wm-panel mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="m-0 text-xl text-slate-900">
              {category[0].toUpperCase() + category.slice(1)} Legacy Collection ({selectedCategoryGallery.length} images)
            </h3>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Recovered order from legacy folders</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {selectedCategoryGallery.map((image, index) => (
              <img
                className="h-28 w-full rounded-xl object-cover"
                key={`${category}-legacy-${index}`}
                src={image}
                alt={`${category} legacy watch ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {products.map((product) => (
          <article className="wm-card overflow-hidden p-3" key={product.id}>
            <Link to={`/products/${product.slug}`}>
              <div className="wm-image-frame h-48">
                <img
                  src={resolveProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                  onError={(event) => onProductImageError(event, product)}
                />
              </div>
            </Link>
            <h3 className="mb-1 mt-3 text-base font-semibold text-slate-900">
              <Link className="hover:underline" to={`/products/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="my-1 text-sm text-slate-600">{product.brand}</p>
            <p className="my-1 text-sm text-slate-600">{product.category?.name || "Uncategorized"}</p>
            <p className="wm-price mt-2 font-bold">Rs. {Number(product.price).toFixed(2)}</p>
          </article>
        ))}
      </section>

      {pagination ? (
        <div className="mt-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <button
            className="wm-btn-secondary px-4"
            type="button"
            onClick={() => {
              const next = Math.max(1, page - 1);
              setPage(next);
              applyFilters({ page: next });
            }}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="wm-btn-secondary px-4"
            type="button"
            onClick={() => {
              const next = Math.min(pagination.totalPages, page + 1);
              setPage(next);
              applyFilters({ page: next });
            }}
            disabled={page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
