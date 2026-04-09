import prisma from "../../config/prisma.js";

function toMoney(value) {
  return Number(value || 0);
}

export async function getAdminOverview() {
  const [
    users,
    sellers,
    activeSellers,
    customers,
    products,
    sellerProducts,
    orders,
    revenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "SELLER", isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { sellerId: { not: null } } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true
      }
    })
  ]);

  return {
    users,
    sellers,
    activeSellers,
    suspendedSellers: Math.max(0, sellers - activeSellers),
    customers,
    products,
    sellerProducts,
    orders,
    totalRevenue: toMoney(revenue._sum.totalAmount)
  };
}

function buildSellerWhere(query) {
  const where = { role: "SELLER" };

  if (query.status === "active") {
    where.isActive = true;
  }

  if (query.status === "suspended") {
    where.isActive = false;
  }

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } }
    ];
  }

  return where;
}

export async function listSellersForAdmin(query) {
  const where = buildSellerWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, sellers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        sellerProducts: {
          select: {
            id: true,
            stock: true,
            price: true
          }
        }
      }
    })
  ]);

  const items = sellers.map((seller) => {
    const listings = seller.sellerProducts.length;
    const totalStock = seller.sellerProducts.reduce((sum, item) => sum + item.stock, 0);

    return {
      id: seller.id,
      fullName: seller.fullName,
      email: seller.email,
      isActive: seller.isActive,
      createdAt: seller.createdAt,
      listings,
      totalStock
    };
  });

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function setSellerActiveStatus(adminId, sellerId, isActive) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true,
      fullName: true,
      isActive: true
    }
  });

  if (!seller || seller.role !== "SELLER") {
    const err = new Error("Seller not found");
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: sellerId },
    data: { isActive },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId,
      targetUserId: sellerId,
      action: "SELLER_STATUS_CHANGED",
      description: isActive
        ? `Activated seller ${seller.fullName}`
        : `Suspended seller ${seller.fullName}`,
      metadata: {
        previousIsActive: seller.isActive,
        nextIsActive: isActive
      }
    }
  });

  return updated;
}

export async function listAdminAuditLogs(query) {
  const skip = (query.page - 1) * query.limit;

  const [total, logs] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        description: true,
        metadata: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        targetUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })
  ]);

  return {
    items: logs,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

function buildOrderWhere(query) {
  const where = {};

  if (query.status !== "all") {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { id: { contains: query.search, mode: "insensitive" } },
      { fullName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } }
    ];
  }

  return where;
}

export async function listOrdersForAdmin(query) {
  const where = buildOrderWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        fullName: true,
        email: true,
        city: true,
        totalAmount: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            sellerStatus: true
          }
        }
      }
    })
  ]);

  return {
    items: orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerName: order.fullName,
      customerEmail: order.email,
      city: order.city,
      totalAmount: Number(order.totalAmount),
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      hasDeliveredItems: order.items.some((item) => item.sellerStatus === "DELIVERED"),
      createdAt: order.createdAt
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function setOrderStatusByAdmin(adminId, orderId, status) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      fullName: true,
      email: true
    }
  });

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        fullName: true,
        email: true,
        city: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: "ORDER_STATUS_UPDATED",
        description: `Updated order ${order.id} status from ${order.status} to ${status}`,
        metadata: {
          orderId: order.id,
          customerName: order.fullName,
          customerEmail: order.email,
          previousStatus: order.status,
          nextStatus: status
        }
      }
    });

    return updated;
  });

  return {
    ...updatedOrder,
    totalAmount: Number(updatedOrder.totalAmount)
  };
}
