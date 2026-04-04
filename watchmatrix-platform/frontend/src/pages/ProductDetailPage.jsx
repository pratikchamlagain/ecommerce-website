import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchProductBySlug, fetchProducts } from "../lib/productsApi";
import { addToCart } from "../lib/cartApi";
import { getAccessToken } from "../lib/authStorage";
import { getBrandLegacyImage, getCategoryLegacyImage } from "../lib/legacyImageMap";

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const queryClient = useQueryClient();
  const token = getAccessToken();

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug)
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const product = productQuery.data;

  function resolveProductImage(item) {
    const fromApi = item?.imageUrl;

    if (typeof fromApi === "string" && fromApi.trim()) {
      return fromApi;
    }

    return getBrandLegacyImage(item?.brand) || getCategoryLegacyImage(item?.category?.slug);
  }

  const galleryImages = useMemo(() => {
    const sourceImage = resolveProductImage(product);

    if (!sourceImage) {
      return [];
    }

    return [
      `${sourceImage}`,
      `${sourceImage}`,
      `${sourceImage}`,
      `${sourceImage}`
    ];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const relatedQuery = useQuery({
    queryKey: ["related-products", product?.category?.slug, slug],
    queryFn: async () => {
      const result = await fetchProducts({
        category: product.category.slug,
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc"
      });

      return (result.items || []).filter((item) => item.slug !== slug).slice(0, 6);
    },
    enabled: Boolean(product?.category?.slug)
  });

  const relatedProducts = relatedQuery.data || [];

  const activeImage = galleryImages[activeImageIndex] || resolveProductImage(product);

  return (
    <PageShell title="Product Detail">
      <Link className="wm-btn-secondary inline-flex rounded-full px-4" to="/products">
        Back to Products
      </Link>

      {productQuery.isPending ? <p className="mt-4 wm-muted">Loading product...</p> : null}
      {productQuery.isError ? <p className="mt-4 text-rose-300">Unable to load product details.</p> : null}

      {product ? (
        <>
        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="wm-card p-4">
            <img className="h-[380px] w-full rounded-2xl bg-slate-800 object-cover" src={activeImage} alt={product.name} />

            {galleryImages.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.map((image, index) => (
                  <button
                    className={index === activeImageIndex ? "overflow-hidden rounded-xl border-2 border-white/60" : "overflow-hidden rounded-xl border border-white/10"}
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img className="h-20 w-full object-cover" src={image} alt={`${product.name} view ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </article>

          <article className="wm-panel">
            <p className="m-0 text-sm uppercase tracking-[0.18em] text-slate-400">{product.category?.name}</p>
            <h3 className="mb-2 mt-2 text-3xl font-semibold text-white">{product.name}</h3>
            <p className="my-0 text-slate-300">{product.description}</p>

            <div className="mt-4 grid gap-1 text-sm text-slate-300">
              <p className="m-0"><strong>Brand:</strong> {product.brand}</p>
              <p className="m-0"><strong>Stock:</strong> {product.stock}</p>
              <p className="m-0 text-lg font-bold wm-price">Rs. {Number(product.price).toFixed(2)}</p>
            </div>

            {!token ? (
              <p className="mt-5 text-sm text-slate-300">
                Please <Link className="wm-price font-semibold" to="/login">sign in</Link> to add this item to your cart.
              </p>
            ) : (
              <button
                className="wm-btn-primary mt-5"
                type="button"
                onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "Adding..." : "Add To Cart"}
              </button>
            )}
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="m-0 text-xl font-semibold text-white">Related Products</h4>
            {product.category?.slug ? (
              <Link className="wm-price text-sm font-semibold" to={`/products?category=${product.category.slug}&page=1`}>
                View More In {product.category.name}
              </Link>
            ) : null}
          </div>

          {relatedQuery.isPending ? <p className="wm-muted">Loading related products...</p> : null}
          {relatedQuery.isError ? <p className="text-rose-300">Unable to load related products.</p> : null}

          {!relatedQuery.isPending && !relatedQuery.isError && relatedProducts.length === 0 ? (
            <p className="wm-panel wm-muted">No related products found yet.</p>
          ) : null}

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <article className="wm-card p-3" key={item.id}>
                  <Link to={`/products/${item.slug}`}>
                    <img className="h-40 w-full rounded-xl bg-slate-800 object-cover" src={resolveProductImage(item)} alt={item.name} loading="lazy" />
                  </Link>
                  <h5 className="mb-1 mt-3 text-base font-semibold text-white">{item.name}</h5>
                  <p className="my-1 text-sm text-slate-400">{item.brand}</p>
                  <p className="wm-price mt-1 font-bold">Rs. {Number(item.price).toFixed(2)}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
        </>
      ) : null}
    </PageShell>
  );
}
