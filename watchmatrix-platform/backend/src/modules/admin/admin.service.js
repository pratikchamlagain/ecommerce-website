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

export async function listSellersForAdmin() {
  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
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
  });

  return sellers.map((seller) => {
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
}

export async function setSellerActiveStatus(sellerId, isActive) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true
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

  return updated;
}
