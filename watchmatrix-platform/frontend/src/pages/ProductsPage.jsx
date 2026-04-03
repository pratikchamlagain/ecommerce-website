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
      <form className="products-filters" onSubmit={onSearchSubmit}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, brand, or description"
        />
        <input
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category slug (e.g. men, women)"
        />
        <button type="submit">Apply</button>
      </form>

      {productsQuery.isPending ? <p>Loading products...</p> : null}
      {productsQuery.isError ? <p>Failed to load products.</p> : null}

      {!productsQuery.isPending && !productsQuery.isError && products.length === 0 ? (
        <p>No products found yet. Add data or adjust filters.</p>
      ) : null}

      <section className="products-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
            <h3>{product.name}</h3>
            <p className="muted">{product.brand}</p>
            <p className="muted">{product.category?.name || "Uncategorized"}</p>
            <p className="price">Rs. {Number(product.price).toFixed(2)}</p>
          </article>
        ))}
      </section>

      {pagination ? (
        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
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
