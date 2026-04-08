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
      subtotal: Number(item.subtotal),
      sellerStatus: item.sellerStatus
    })),
    createdAt: order.createdAt
  };
}

const allowedSellerStatusTransitions = {
  PENDING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

function deriveOrderStatusFromSellerItems(statuses) {
  if (statuses.length === 0) {
    return "PENDING";
  }

  if (statuses.every((status) => status === "DELIVERED")) {
    return "COMPLETED";
  }

  if (statuses.every((status) => status === "CANCELLED")) {
    return "CANCELLED";
  }

  if (statuses.some((status) => ["PACKED", "SHIPPED", "DELIVERED"].includes(status))) {
    return "PROCESSING";
  }

  return "PENDING";
}

function withSellerStatusMeta(item) {
  const allowedNextStatuses = allowedSellerStatusTransitions[item.sellerStatus] || [];

  return {
    ...item,
    allowedNextStatuses,
    editableStatuses: [item.sellerStatus, ...allowedNextStatuses]
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

export async function listOrderItemsBySeller(sellerId, query) {
  const skip = (query.page - 1) * query.limit;
  const where = {
    product: {
      sellerId
    }
  };

  if (query.status) {
    where.order = {
      status: {
        equals: query.status,
        mode: "insensitive"
      }
    };
  }

  const [total, items] = await Promise.all([
    prisma.orderItem.count({ where }),
    prisma.orderItem.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            fullName: true,
            email: true,
            phone: true,
            city: true,
            addressLine1: true,
            postalCode: true,
            createdAt: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            imageUrl: true
          }
        }
      }
    })
  ]);

  return {
    items: items.map((item) => withSellerStatusMeta({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productSlug: item.product?.slug || null,
      productImageUrl: item.product?.imageUrl || null,
      productName: item.productName,
      productBrand: item.productBrand,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      sellerStatus: item.sellerStatus,
      order: {
        id: item.order.id,
        status: item.order.status,
        paymentMethod: item.order.paymentMethod,
        customerName: item.order.fullName,
        customerEmail: item.order.email,
        customerPhone: item.order.phone,
        city: item.order.city,
        addressLine1: item.order.addressLine1,
        postalCode: item.order.postalCode,
        createdAt: item.order.createdAt
      },
      createdAt: item.createdAt
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function updateSellerOrderItemStatus(sellerId, itemId, sellerStatus) {
  const item = await prisma.orderItem.findFirst({
    where: {
      id: itemId,
      product: {
        sellerId
      }
    },
    include: {
      order: {
        select: {
          id: true,
          status: true
        }
      },
      product: {
        select: {
          id: true,
          slug: true,
          imageUrl: true
        }
      }
    }
  });

  if (!item) {
    const err = new Error("Order item not found");
    err.statusCode = 404;
    throw err;
  }

  const allowedTransitions = allowedSellerStatusTransitions[item.sellerStatus] || [];
  if (!allowedTransitions.includes(sellerStatus) && sellerStatus !== item.sellerStatus) {
    const err = new Error(`Invalid status transition from ${item.sellerStatus} to ${sellerStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.orderItem.update({
      where: { id: itemId },
      data: { sellerStatus },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            fullName: true,
            email: true,
            phone: true,
            city: true,
            addressLine1: true,
            postalCode: true,
            createdAt: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            imageUrl: true
          }
        }
      }
    });

    const siblingItems = await tx.orderItem.findMany({
      where: { orderId: changed.orderId },
      select: { sellerStatus: true }
    });

    const nextOrderStatus = deriveOrderStatusFromSellerItems(
      siblingItems.map((sibling) => sibling.sellerStatus)
    );

    await tx.order.update({
      where: { id: changed.orderId },
      data: { status: nextOrderStatus }
    });

    await tx.sellerFulfillmentLog.create({
      data: {
        sellerId,
        orderItemId: itemId,
        previousStatus: item.sellerStatus,
        nextStatus: sellerStatus
      }
    });

    return changed;
  });

  return withSellerStatusMeta({
    id: updated.id,
    orderId: updated.orderId,
    productId: updated.productId,
    productSlug: updated.product?.slug || null,
    productImageUrl: updated.product?.imageUrl || null,
    productName: updated.productName,
    productBrand: updated.productBrand,
    quantity: updated.quantity,
    unitPrice: Number(updated.unitPrice),
    subtotal: Number(updated.subtotal),
    sellerStatus: updated.sellerStatus,
    order: {
      id: updated.order.id,
      status: updated.order.status,
      paymentMethod: updated.order.paymentMethod,
      customerName: updated.order.fullName,
      customerEmail: updated.order.email,
      customerPhone: updated.order.phone,
      city: updated.order.city,
      addressLine1: updated.order.addressLine1,
      postalCode: updated.order.postalCode,
      createdAt: updated.order.createdAt
    },
    createdAt: updated.createdAt
  });
}

export async function listSellerFulfillmentLogs(sellerId, query) {
  const skip = (query.page - 1) * query.limit;

  const [total, logs] = await Promise.all([
    prisma.sellerFulfillmentLog.count({ where: { sellerId } }),
    prisma.sellerFulfillmentLog.findMany({
      where: { sellerId },
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      include: {
        orderItem: {
          select: {
            id: true,
            productName: true,
            productBrand: true,
            orderId: true
          }
        }
      }
    })
  ]);

  return {
    items: logs.map((log) => ({
      id: log.id,
      orderItemId: log.orderItemId,
      orderId: log.orderItem?.orderId || null,
      productName: log.orderItem?.productName || "Unknown Product",
      productBrand: log.orderItem?.productBrand || "",
      previousStatus: log.previousStatus,
      nextStatus: log.nextStatus,
      createdAt: log.createdAt
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}
