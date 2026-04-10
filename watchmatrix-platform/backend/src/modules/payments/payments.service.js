import crypto from "node:crypto";
import prisma from "../../config/prisma.js";
import { createOrder } from "../orders/orders.service.js";

const inMemoryPaymentLocks = new Map();

function getOrigin() {
  return process.env.FRONTEND_BASE_URL || "http://localhost:5173";
}

function getBackendBase() {
  return process.env.BACKEND_BASE_URL || "http://localhost:5000";
}

function assertCartReady(cart) {
  if (!cart || cart.items.length === 0) {
    const err = new Error("Cart is empty");
    err.statusCode = 400;
    throw err;
  }
}

async function getCartForPayment(userId) {
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

  assertCartReady(cart);

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      const err = new Error(`${item.product.name} is out of stock for requested quantity`);
      err.statusCode = 400;
      throw err;
    }
  }

  const amount = Number(
    cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2)
  );

  return { cart, amount };
}

function buildTxnRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function signEsewa(params, secretKey) {
  const ordered = `total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`;
  return crypto
    .createHmac("sha256", secretKey)
    .update(ordered)
    .digest("base64");
}

export async function initiateEsewa(userId, payload) {
  const { amount } = await getCartForPayment(userId);

  const productCode = process.env.ESEWA_PRODUCT_CODE;
  const secret = process.env.ESEWA_SECRET_KEY;

  if (!productCode || !secret) {
    const err = new Error("eSewa configuration is missing");
    err.statusCode = 500;
    throw err;
  }

  const transaction_uuid = buildTxnRef("esewa");
  const success_url = `${getOrigin()}/payment-return?provider=esewa`;
  const failure_url = `${getOrigin()}/checkout?payment=failed&provider=esewa`;
  const total_amount = amount.toFixed(2);

  const formData = {
    amount: total_amount,
    tax_amount: "0",
    total_amount,
    transaction_uuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url,
    failure_url,
    signed_field_names: "total_amount,transaction_uuid,product_code"
  };

  formData.signature = signEsewa(formData, secret);

  return {
    provider: "ESEWA",
    transactionRef: transaction_uuid,
    amount,
    paymentUrl: process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    formData
  };
}

export async function verifyEsewaAndCreateOrder(userId, payload) {
  const { data, checkout } = payload;
  const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8"));

  const transactionRef = decoded.transaction_uuid || decoded.transaction_code;
  if (!transactionRef) {
    const err = new Error("Invalid eSewa response");
    err.statusCode = 400;
    throw err;
  }

  if (inMemoryPaymentLocks.has(transactionRef)) {
    return inMemoryPaymentLocks.get(transactionRef);
  }

  if ((decoded.status || "").toUpperCase() !== "COMPLETE") {
    const err = new Error("eSewa payment is not completed");
    err.statusCode = 400;
    throw err;
  }

  const resultPromise = createOrder(userId, { ...checkout, paymentMethod: "ESEWA" }, { paymentVerified: true })
    .then((order) => ({
      provider: "ESEWA",
      verified: true,
      transactionRef,
      order
    }))
    .finally(() => {
      inMemoryPaymentLocks.delete(transactionRef);
    });

  inMemoryPaymentLocks.set(transactionRef, resultPromise);
  return resultPromise;
}

export async function initiateKhalti(userId, payload) {
  const { amount } = await getCartForPayment(userId);

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey || secretKey.includes("replace") || secretKey.includes("placeholder")) {
    const err = new Error("Khalti secret key is missing or placeholder");
    err.statusCode = 400;
    throw err;
  }

  const purchase_order_id = buildTxnRef("khalti");
  const requestBody = {
    return_url: `${getOrigin()}/payment-return?provider=khalti`,
    website_url: getOrigin(),
    amount: Math.round(amount * 100),
    purchase_order_id,
    purchase_order_name: `WatchMatrix order ${purchase_order_id.slice(-6)}`
  };

  const response = await fetch(process.env.KHALTI_INITIATE_URL || "https://dev.khalti.com/api/v2/epayment/initiate/", {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(json?.detail || json?.message || "Khalti provider request failed");
    err.statusCode = 400;
    throw err;
  }

  return {
    provider: "KHALTI",
    transactionRef: purchase_order_id,
    pidx: json.pidx,
    amount,
    paymentUrl: json.payment_url,
    expiresAt: json.expires_at || null
  };
}

export async function verifyKhaltiAndCreateOrder(userId, payload) {
  const { pidx, checkout } = payload;
  const secretKey = process.env.KHALTI_SECRET_KEY;

  if (!secretKey || secretKey.includes("replace") || secretKey.includes("placeholder")) {
    const err = new Error("Khalti secret key is missing or placeholder");
    err.statusCode = 400;
    throw err;
  }

  if (inMemoryPaymentLocks.has(pidx)) {
    return inMemoryPaymentLocks.get(pidx);
  }

  const response = await fetch(process.env.KHALTI_LOOKUP_URL || "https://dev.khalti.com/api/v2/epayment/lookup/", {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pidx })
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(json?.detail || json?.message || "Khalti verification failed");
    err.statusCode = 400;
    throw err;
  }

  const status = String(json.status || "").toUpperCase();
  if (status !== "COMPLETED") {
    const err = new Error(`Khalti payment is ${json.status || "not completed"}`);
    err.statusCode = 400;
    throw err;
  }

  const resultPromise = createOrder(userId, { ...checkout, paymentMethod: "KHALTI" }, { paymentVerified: true })
    .then((order) => ({
      provider: "KHALTI",
      verified: true,
      transactionRef: json.transaction_id || pidx,
      order
    }))
    .finally(() => {
      inMemoryPaymentLocks.delete(pidx);
    });

  inMemoryPaymentLocks.set(pidx, resultPromise);
  return resultPromise;
}

export async function listPaymentsForUser(userId, query) {
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        paymentMethod: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    items: orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      provider: order.paymentMethod,
      amount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function listPaymentsForAdmin(query) {
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        paymentMethod: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        user: {
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
    items: orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      provider: order.paymentMethod,
      amount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.user
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}
