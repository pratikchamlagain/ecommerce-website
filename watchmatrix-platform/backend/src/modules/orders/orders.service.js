import prisma from "../../config/prisma.js";

function toPublicOrder(order) {
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalAmount: Number(order.totalAmount),
    shipping: {
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      postalCode: order.postalCode,
      notes: order.notes
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productBrand: item.productBrand,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal)
    })),
    createdAt: order.createdAt
  };
}

export async function createOrder(userId, payload) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    const err = new Error("Cart is empty");
    err.statusCode = 400;
    throw err;
  }

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      const err = new Error(`${item.product.name} is out of stock for requested quantity`);
      err.statusCode = 400;
      throw err;
    }
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        city: payload.city,
        postalCode: payload.postalCode,
        notes: payload.notes,
        paymentMethod: payload.paymentMethod,
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: Number(item.product.price) * item.quantity,
            productName: item.product.name,
            productBrand: item.product.brand
          }))
        }
      },
      include: {
        items: true
      }
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    return createdOrder;
  });

  return toPublicOrder(order);
}

export async function listOrdersByUser(userId) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return orders.map(toPublicOrder);
}

export async function getOrderByIdForUser(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: true
    }
  });

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  return toPublicOrder(order);
}
