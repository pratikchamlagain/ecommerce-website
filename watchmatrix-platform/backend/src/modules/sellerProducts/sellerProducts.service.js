import prisma from "../../config/prisma.js";
import { resolveProductImageUrl } from "../../utils/productImageStorage.js";

function toSellerProduct(product) {
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

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function createUniqueSlug(name, ignoreProductId = null) {
  const base = slugify(name) || "product";
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? base : `${base}-${counter}`;
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === ignoreProductId) {
      return candidate;
    }

    counter += 1;
  }
}

async function getCategoryIdBySlug(categorySlug) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true }
  });

  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  return category.id;
}

export async function listSellerProducts(sellerId) {
  const products = await prisma.product.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  return products.map(toSellerProduct);
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });
}

export async function createSellerProduct(sellerId, payload) {
  const [slug, categoryId] = await Promise.all([
    createUniqueSlug(payload.name),
    getCategoryIdBySlug(payload.categorySlug)
  ]);

  const resolvedImageUrl = await resolveProductImageUrl({
    imageUrl: payload.imageUrl,
    productName: payload.name
  });

  const product = await prisma.product.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      brand: payload.brand,
      price: payload.price,
      stock: payload.stock,
      imageUrl: resolvedImageUrl,
      categoryId,
      sellerId
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  return toSellerProduct(product);
}

export async function updateSellerProduct(sellerId, productId, payload) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, sellerId },
    select: { id: true, name: true, imageUrl: true }
  });

  if (!existing) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const data = { ...payload };

  if (payload.imageUrl) {
    if (payload.imageUrl !== existing.imageUrl) {
      data.imageUrl = await resolveProductImageUrl({
        imageUrl: payload.imageUrl,
        productName: payload.name || existing.name
      });
    }
  }

  if (payload.name) {
    data.slug = await createUniqueSlug(payload.name, productId);
  }

  if (payload.categorySlug) {
    data.categoryId = await getCategoryIdBySlug(payload.categorySlug);
    delete data.categorySlug;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data,
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  return toSellerProduct(product);
}

export async function deleteSellerProduct(sellerId, productId) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, sellerId },
    select: { id: true }
  });

  if (!existing) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (error) {
    if (error.code === "P2003") {
      const err = new Error("Product cannot be deleted because it exists in placed orders");
      err.statusCode = 409;
      throw err;
    }

    throw error;
  }
}
