import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

process.env.ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "test-esewa-secret";
process.env.KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "invalid-placeholder-key";
process.env.FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

function nowSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function main() {
  const suffix = nowSuffix();
  const customerEmail = `pay-customer-${suffix}@test.local`;
  const sellerEmail = `pay-seller-${suffix}@test.local`;
  const adminEmail = `pay-admin-${suffix}@test.local`;

  const health = await request(app).get("/api/v1/health");

  const customerAuth = await request(app).post("/api/v1/auth/register").send({
    fullName: "Pay Customer",
    email: customerEmail,
    password: "Passw0rd!",
    role: "CUSTOMER"
  });

  const sellerAuth = await request(app).post("/api/v1/auth/register").send({
    fullName: "Pay Seller",
    email: sellerEmail,
    password: "Passw0rd!",
    role: "SELLER"
  });

  const customerToken = customerAuth.body?.data?.accessToken;
  const sellerId = sellerAuth.body?.data?.user?.id;

  const category = await prisma.category.create({
    data: {
      name: `PayCat-${suffix}`,
      slug: `paycat-${suffix}`
    }
  });

  const product = await prisma.product.create({
    data: {
      name: `Pay Product ${suffix}`,
      slug: `pay-product-${suffix}`,
      description: "payment validation product",
      brand: "WM",
      price: 1999,
      stock: 5,
      imageUrl: "https://example.com/pay.jpg",
      categoryId: category.id,
      sellerId
    }
  });

  await request(app)
    .post("/api/v1/cart/items")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ productId: product.id, quantity: 1 });

  const checkoutEsewa = {
    fullName: "Pay Customer",
    email: customerEmail,
    phone: "9800000000",
    addressLine1: "Kathmandu",
    addressLine2: "",
    city: "Kathmandu",
    postalCode: "44600",
    notes: "",
    paymentMethod: "BANK_TRANSFER"
  };

  const checkoutKhalti = {
    ...checkoutEsewa,
    paymentMethod: "CARD"
  };

  const esewa = await request(app)
    .post("/api/v1/payments/esewa/initiate")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ checkout: checkoutEsewa });

  const khalti = await request(app)
    .post("/api/v1/payments/khalti/initiate")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ checkout: checkoutKhalti });

  const customerHistory = await request(app)
    .get("/api/v1/payments/history")
    .set("Authorization", `Bearer ${customerToken}`);

  const adminPasswordHash = await bcrypt.hash("Passw0rd!", 10);
  const admin = await prisma.user.create({
    data: {
      fullName: "Pay Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true
    }
  });

  const adminToken = jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  const adminHistory = await request(app)
    .get("/api/v1/payments/admin/history")
    .set("Authorization", `Bearer ${adminToken}`);

  console.log(JSON.stringify({
    health: health.statusCode,
    esewa: {
      status: esewa.statusCode,
      hasPaymentUrl: Boolean(esewa.body?.data?.paymentUrl),
      hasPayload: Boolean(esewa.body?.data?.payload)
    },
    khalti: {
      status: khalti.statusCode,
      message: khalti.body?.message || null
    },
    customerHistory: customerHistory.statusCode,
    adminHistory: adminHistory.statusCode
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
