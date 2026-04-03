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
    <PageShell title="Products">
      <form className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={onSearchSubmit}>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, brand, or description"
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category slug (e.g. men, women)"
        />
        <button className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-white" type="submit">Apply</button>
      </form>

      {productsQuery.isPending ? <p>Loading products...</p> : null}
      {productsQuery.isError ? <p>Failed to load products.</p> : null}

      {!productsQuery.isPending && !productsQuery.isError && products.length === 0 ? (
        <p>No products found yet. Add data or adjust filters.</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
        {products.map((product) => (
          <article className="rounded-xl border border-slate-200 bg-white p-3" key={product.id}>
            <img className="h-44 w-full rounded-lg bg-slate-100 object-cover" src={product.imageUrl} alt={product.name} loading="lazy" />
            <h3 className="mb-1 mt-3 text-base font-semibold">{product.name}</h3>
            <p className="my-1 text-sm text-slate-500">{product.brand}</p>
            <p className="my-1 text-sm text-slate-500">{product.category?.name || "Uncategorized"}</p>
            <p className="mt-2 font-bold text-slate-900">Rs. {Number(product.price).toFixed(2)}</p>
          </article>
        ))}
      </section>

      {pagination ? (
        <div className="mt-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <button
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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
