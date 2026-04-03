import prisma from "../../config/prisma.js";

function toPublicCart(cart) {
  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    const subtotal = Number((price * item.quantity).toFixed(2));

    return {
      id: item.id,
      quantity: item.quantity,
      subtotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
        price
      }
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  return {
    id: cart.id,
    userId: cart.userId,
    updatedAt: cart.updatedAt,
    totals: {
      totalItems,
      totalAmount
    },
    items
  };
}

async function getOrCreateCart(userId) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
}

export async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  return toPublicCart(cart);
}

export async function addItemToCart(userId, { productId, quantity }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.productId === productId);

  const nextQuantity = (existingItem?.quantity || 0) + quantity;

  if (nextQuantity > product.stock) {
    const err = new Error("Requested quantity exceeds stock");
    err.statusCode = 400;
    throw err;
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      }
    });
  }

  return getCart(userId);
}

export async function updateCartItem(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => cartItem.id === itemId);

  if (!item) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  if (quantity > item.product.stock) {
    const err = new Error("Requested quantity exceeds stock");
    err.statusCode = 400;
    throw err;
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  });

  return getCart(userId);
}

export async function removeCartItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => cartItem.id === itemId);

  if (!item) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id
    }
  });

  return getCart(userId);
}
