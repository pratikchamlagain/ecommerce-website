import PageShell from "../components/common/PageShell";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/productsApi";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc"
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (category.trim()) {
      params.category = category.trim();
    }

    return params;
  }, [category, page, search]);

  const productsQuery = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => fetchProducts(queryParams)
  });

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  function onSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <PageShell title="Explore Collection">
      <form className="mb-5 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={onSearchSubmit}>
        <input
          className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-200/60 focus:outline-none"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, brand, or description"
        />
        <input
          className="rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-200/60 focus:outline-none"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category slug (e.g. men, women)"
        />
        <button className="rounded-xl border border-amber-200/50 bg-amber-200/10 px-4 py-2 font-medium text-amber-100 transition hover:bg-amber-200/20" type="submit">Apply</button>
      </form>

      {productsQuery.isPending ? <p className="text-slate-300">Loading products...</p> : null}
      {productsQuery.isError ? <p className="text-rose-300">Failed to load products.</p> : null}

      {!productsQuery.isPending && !productsQuery.isError && products.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-slate-300">No products found yet. Add data or adjust filters.</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {products.map((product) => (
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-3 shadow-xl shadow-black/20" key={product.id}>
            <img className="h-48 w-full rounded-xl bg-slate-800 object-cover" src={product.imageUrl} alt={product.name} loading="lazy" />
            <h3 className="mb-1 mt-3 text-base font-semibold text-white">{product.name}</h3>
            <p className="my-1 text-sm text-slate-400">{product.brand}</p>
            <p className="my-1 text-sm text-slate-400">{product.category?.name || "Uncategorized"}</p>
            <p className="mt-2 font-bold text-amber-200">Rs. {Number(product.price).toFixed(2)}</p>
          </article>
        ))}
      </section>

      {pagination ? (
        <div className="mt-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <button
            className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
