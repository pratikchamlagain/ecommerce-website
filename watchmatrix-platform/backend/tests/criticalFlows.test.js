import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

function unique(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function registerUserViaApi({ fullName, email, password, role }) {
  const payload = { fullName, email, password, role };

  if (role === "SELLER") {
    payload.sellerProfile = {
      businessName: `${fullName} Ventures`,
      businessType: "Retail",
      businessAddress: "Kathmandu Trade Center",
      panOrVat: `PAN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      phone: "9800000001",
      yearsInBusiness: 3,
      monthlyOrderVolume: "50-100",
      websiteUrl: "https://example-seller.test"
    };
  }

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  assert.equal(response.statusCode, 201);
  return response.body.data;
}

async function createAdminDirect({ fullName, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  });

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  return { user, accessToken };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

test("Buyer order lifecycle: place -> seller fulfill -> notifications -> cancel guards", { concurrency: false }, async () => {
  const customerEmail = `${unique("customer")}@test.local`;
  const sellerEmail = `${unique("seller")}@test.local`;

  const customerAuth = await registerUserViaApi({
    fullName: "Buyer Flow",
    email: customerEmail,
    password: "Passw0rd!",
    role: "CUSTOMER"
  });

  const sellerAuth = await registerUserViaApi({
    fullName: "Seller Flow",
    email: sellerEmail,
    password: "Passw0rd!",
    role: "SELLER"
  });

  const category = await prisma.category.create({
    data: {
      name: unique("Category"),
      slug: unique("category")
    }
  });

  const product = await prisma.product.create({
    data: {
      name: unique("Product"),
      slug: unique("product"),
      description: "Lifecycle test product",
      brand: "WM",
      price: 1999,
      stock: 10,
      imageUrl: "https://example.com/image.jpg",
      categoryId: category.id,
      sellerId: sellerAuth.user.id
    }
  });

  const customerCart = await prisma.cart.findUnique({ where: { userId: customerAuth.user.id } });
  assert.ok(customerCart?.id);

  await prisma.cartItem.create({
    data: {
      cartId: customerCart.id,
      productId: product.id,
      quantity: 1
    }
  });

  const placeOrderResponse = await request(app)
    .post("/api/v1/orders")
    .set(authHeader(customerAuth.accessToken))
    .send({
      fullName: "Buyer Flow",
      email: customerEmail,
      phone: "9800000000",
      addressLine1: "Kathmandu Street",
      addressLine2: "",
      city: "Kathmandu",
      postalCode: "44600",
      notes: "",
      paymentMethod: "COD"
    });

  assert.equal(placeOrderResponse.statusCode, 201);
  const orderId = placeOrderResponse.body.data.id;

  const sellerItemsResponse = await request(app)
    .get("/api/v1/orders/seller/items?page=1&limit=20")
    .set(authHeader(sellerAuth.accessToken));

  assert.equal(sellerItemsResponse.statusCode, 200);
  const orderItem = (sellerItemsResponse.body.data.items || []).find((item) => item.orderId === orderId);
  assert.ok(orderItem?.id);

  const packResponse = await request(app)
    .patch(`/api/v1/orders/seller/items/${orderItem.id}/status`)
    .set(authHeader(sellerAuth.accessToken))
    .send({ sellerStatus: "PACKED" });

  assert.equal(packResponse.statusCode, 200);

  const notificationResponse = await request(app)
    .get("/api/v1/notifications")
    .set(authHeader(customerAuth.accessToken));

  assert.equal(notificationResponse.statusCode, 200);
  const hasStatusNotification = (notificationResponse.body.data || []).some(
    (notification) => notification.type === "ORDER_ITEM_STATUS_UPDATED"
  );
  assert.equal(hasStatusNotification, true);

  const cancelResponse = await request(app)
    .patch(`/api/v1/orders/${orderId}/cancel`)
    .set(authHeader(customerAuth.accessToken));

  assert.equal(cancelResponse.statusCode, 400);
});

test("Chat lifecycle: create -> send -> escalate -> admin joins", { concurrency: false }, async () => {
  const customerAuth = await registerUserViaApi({
    fullName: "Chat Buyer",
    email: `${unique("chat-customer")}@test.local`,
    password: "Passw0rd!",
    role: "CUSTOMER"
  });

  const sellerAuth = await registerUserViaApi({
    fullName: "Chat Seller",
    email: `${unique("chat-seller")}@test.local`,
    password: "Passw0rd!",
    role: "SELLER"
  });

  await createAdminDirect({
    fullName: "Chat Admin",
    email: `${unique("chat-admin")}@test.local`,
    password: "Passw0rd!"
  });

  const createConversationResponse = await request(app)
    .post("/api/v1/chat/conversations")
    .set(authHeader(customerAuth.accessToken))
    .send({ participantId: sellerAuth.user.id });

  assert.equal(createConversationResponse.statusCode, 201);
  const conversationId = createConversationResponse.body.data.id;

  const sendMessageResponse = await request(app)
    .post(`/api/v1/chat/conversations/${conversationId}/messages`)
    .set(authHeader(customerAuth.accessToken))
    .send({ content: "Hello seller, I need help." });

  assert.equal(sendMessageResponse.statusCode, 201);

  const sellerConversationResponse = await request(app)
    .get("/api/v1/chat/conversations")
    .set(authHeader(sellerAuth.accessToken));

  assert.equal(sellerConversationResponse.statusCode, 200);
  const sellerSeesConversation = (sellerConversationResponse.body.data || []).some(
    (conversation) => conversation.id === conversationId
  );
  assert.equal(sellerSeesConversation, true);

  const escalationResponse = await request(app)
    .post(`/api/v1/chat/conversations/${conversationId}/escalate`)
    .set(authHeader(sellerAuth.accessToken));

  assert.equal(escalationResponse.statusCode, 200);
  assert.equal(escalationResponse.body.data.escalated, true);

  const escalationAdmin = await prisma.user.findUnique({
    where: {
      id: escalationResponse.body.data.adminId
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  assert.ok(escalationAdmin?.id);

  const escalationAdminToken = jwt.sign(
    { sub: escalationAdmin.id, email: escalationAdmin.email, role: escalationAdmin.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  const adminConversationResponse = await request(app)
    .get("/api/v1/chat/conversations")
    .set(authHeader(escalationAdminToken));

  assert.equal(adminConversationResponse.statusCode, 200);
  const adminSeesConversation = (adminConversationResponse.body.data || []).some(
    (conversation) => conversation.id === conversationId
  );
  assert.equal(adminSeesConversation, true);
});

test("Admin controls: seller status, order status, escalation feed", { concurrency: false }, async () => {
  const customerAuth = await registerUserViaApi({
    fullName: "Admin Buyer",
    email: `${unique("admin-customer")}@test.local`,
    password: "Passw0rd!",
    role: "CUSTOMER"
  });

  const sellerAuth = await registerUserViaApi({
    fullName: "Admin Seller",
    email: `${unique("admin-seller")}@test.local`,
    password: "Passw0rd!",
    role: "SELLER"
  });

  const adminAuth = await createAdminDirect({
    fullName: "Main Admin",
    email: `${unique("main-admin")}@test.local`,
    password: "Passw0rd!"
  });

  const suspendResponse = await request(app)
    .patch(`/api/v1/admin/sellers/${sellerAuth.user.id}/status`)
    .set(authHeader(adminAuth.accessToken))
    .send({ isActive: false });

  assert.equal(suspendResponse.statusCode, 200);

  const activateResponse = await request(app)
    .patch(`/api/v1/admin/sellers/${sellerAuth.user.id}/status`)
    .set(authHeader(adminAuth.accessToken))
    .send({ isActive: true });

  assert.equal(activateResponse.statusCode, 200);

  const category = await prisma.category.create({
    data: {
      name: unique("Admin Category"),
      slug: unique("admin-category")
    }
  });

  const product = await prisma.product.create({
    data: {
      name: unique("Admin Product"),
      slug: unique("admin-product"),
      description: "Admin controls test product",
      brand: "WM",
      price: 2500,
      stock: 8,
      imageUrl: "https://example.com/admin-image.jpg",
      categoryId: category.id,
      sellerId: sellerAuth.user.id
    }
  });

  const customerCart = await prisma.cart.findUnique({ where: { userId: customerAuth.user.id } });
  assert.ok(customerCart?.id);

  await prisma.cartItem.create({
    data: {
      cartId: customerCart.id,
      productId: product.id,
      quantity: 1
    }
  });

  const placeOrderResponse = await request(app)
    .post("/api/v1/orders")
    .set(authHeader(customerAuth.accessToken))
    .send({
      fullName: "Admin Buyer",
      email: customerAuth.user.email,
      phone: "9811111111",
      addressLine1: "Lalitpur Street",
      addressLine2: "",
      city: "Lalitpur",
      postalCode: "44700",
      notes: "",
      paymentMethod: "COD"
    });

  assert.equal(placeOrderResponse.statusCode, 201);
  const orderId = placeOrderResponse.body.data.id;

  const updateOrderStatusResponse = await request(app)
    .patch(`/api/v1/admin/orders/${orderId}/status`)
    .set(authHeader(adminAuth.accessToken))
    .send({ status: "PROCESSING" });

  assert.equal(updateOrderStatusResponse.statusCode, 200);

  const createConversationResponse = await request(app)
    .post("/api/v1/chat/conversations")
    .set(authHeader(customerAuth.accessToken))
    .send({ participantId: sellerAuth.user.id, orderId });

  assert.equal(createConversationResponse.statusCode, 201);
  const conversationId = createConversationResponse.body.data.id;

  const escalationResponse = await request(app)
    .post(`/api/v1/chat/conversations/${conversationId}/escalate`)
    .set(authHeader(sellerAuth.accessToken));

  assert.equal(escalationResponse.statusCode, 200);
  assert.equal(escalationResponse.body.data.escalated, true);

  const escalationAdmin = await prisma.user.findUnique({
    where: {
      id: escalationResponse.body.data.adminId
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  assert.ok(escalationAdmin?.id);

  const escalationAdminToken = jwt.sign(
    { sub: escalationAdmin.id, email: escalationAdmin.email, role: escalationAdmin.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  const escalationFeedResponse = await request(app)
    .get("/api/v1/chat/escalations?page=1&limit=20")
    .set(authHeader(escalationAdminToken));

  assert.equal(escalationFeedResponse.statusCode, 200);

  const hasEscalation = (escalationFeedResponse.body.data.items || []).some(
    (item) => item.conversationId === conversationId
  );
  assert.equal(hasEscalation, true);
});
