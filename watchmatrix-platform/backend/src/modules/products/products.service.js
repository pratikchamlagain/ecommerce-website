import prisma from "../../config/prisma.js";

function toPublicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    price: Number(product.price),
    stock: product.stock,
    imageUrl: product.imageUrl,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

function buildWhereClause(filters) {
  const where = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } }
    ];
  }

  if (filters.brand) {
    where.brand = { equals: filters.brand, mode: "insensitive" };
  }

  if (filters.category) {
    where.category = {
      slug: filters.category
    };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};

    if (filters.minPrice != null) {
      where.price.gte = filters.minPrice;
    }

    if (filters.maxPrice != null) {
      where.price.lte = filters.maxPrice;
    }
  }

  return where;
}

export async function listProducts(filters) {
  const skip = (filters.page - 1) * filters.limit;
  const where = buildWhereClause(filters);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: {
        [filters.sortBy]: filters.sortOrder
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
  ]);

  return {
    items: products.map(toPublicProduct),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit))
    }
  };
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  return toPublicProduct(product);
}
