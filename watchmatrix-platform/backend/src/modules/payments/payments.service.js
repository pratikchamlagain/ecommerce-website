import crypto from "node:crypto";
import prisma from "../../config/prisma.js";
import { createOrder } from "../orders/orders.service.js";

const ESEWA_SANDBOX_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const KHALTI_INITIATE_SANDBOX_URL = "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_SANDBOX_URL = "https://dev.khalti.com/api/v2/epayment/lookup/";
const ESEWA_STATUS_SANDBOX_URL = "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

function frontendBaseUrl() {
  return (process.env.FRONTEND_BASE_URL || "http://localhost:5173").trim();
}

function appendQueryParams(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function resolveEsewaProductCode() {
  return (process.env.ESEWA_PRODUCT_CODE || process.env.ESEWA_MERCHANT_CODE || "EPAYTEST").trim();
}

function createPaymentRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeNotes(originalNotes, paymentTag) {
  const base = (originalNotes || "").trim();
  const merged = base ? `${base} | ${paymentTag}` : paymentTag;
  return merged.slice(0, 500);
}

function toMoney(value) {
  return Number(value || 0);
}

function toPaisa(amount) {
  return Math.round(toMoney(amount) * 100);
}

function createEsewaSignature({ totalAmount, transactionUuid, productCode, secret }) {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = crypto.createHmac("sha256", secret).update(message).digest("base64");

  return {
    signedFieldNames,
    signature
  };
}

function verifyEsewaResponseSignature(responsePayload, secret) {
  const signedFieldNames = (responsePayload.signed_field_names || "").split(",").map((field) => field.trim()).filter(Boolean);

  if (signedFieldNames.length === 0 || !responsePayload.signature) {
    return false;
  }

  const message = signedFieldNames.map((field) => `${field}=${responsePayload[field] ?? ""}`).join(",");
  const expected = crypto.createHmac("sha256", secret).update(message).digest("base64");
  return expected === responsePayload.signature;
}

function normalizePaymentProvider(paymentMethod) {
  if (paymentMethod === "CARD") {
    return "KHALTI";
  }

  if (paymentMethod === "BANK_TRANSFER") {
    return "ESEWA";
  }

  return "COD";
}

async function ensureProviderOwnership({ userId, paymentRef, provider }) {
  if (!paymentRef) {
    return { ok: true };
  }

  const existing = await prisma.order.findFirst({
    where: {
      userId,
      notes: {
        contains: paymentRef
      }
    },
    select: {
      id: true,
      paymentMethod: true,
      status: true,
      totalAmount: true,
      createdAt: true
    }
  });

  if (!existing) {
    return { ok: true };
  }

  const activeProvider = normalizePaymentProvider(existing.paymentMethod);
  if (activeProvider !== provider) {
    return {
      error: {
        code: 409,
        message: `Another payment attempt is active via ${activeProvider}.`
      }
    };
  }

  return {
    alreadyProcessed: {
      order: {
        id: existing.id,
        status: existing.status,
        paymentMethod: existing.paymentMethod,
        totalAmount: toMoney(existing.totalAmount),
        createdAt: existing.createdAt
      },
      alreadyProcessed: true,
      provider: activeProvider
    }
  };
}

async function getCartQuote(userId) {
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

  const totalAmount = toMoney(
    cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  );

  return {
    totalAmount,
    totalPaisa: toPaisa(totalAmount),
    itemsCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let data = null;

  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

export async function initiateEsewaPayment(userId, checkout) {
  const quote = await getCartQuote(userId);
  const productCode = resolveEsewaProductCode();
  const secret = (process.env.ESEWA_SECRET_KEY || "").trim();

  if (!secret) {
    const err = new Error("eSewa secret key is not configured");
    err.statusCode = 500;
    throw err;
  }

  const paymentRef = createPaymentRef("esewa");
  const successBaseUrl = (process.env.ESEWA_SUCCESS_URL || `${frontendBaseUrl()}/payment/esewa/success`).trim();
  const failureBaseUrl = (process.env.ESEWA_FAILURE_URL || `${frontendBaseUrl()}/payment/failure`).trim();
  const successUrl = appendQueryParams(successBaseUrl, { ref: paymentRef, provider: "esewa" });
  const failureUrl = appendQueryParams(failureBaseUrl, { ref: paymentRef, provider: "esewa" });

  const signatureMeta = createEsewaSignature({
    totalAmount: quote.totalAmount.toFixed(2),
    transactionUuid: paymentRef,
    productCode,
    secret
  });

  return {
    provider: "ESEWA",
    paymentRef,
    amount: quote.totalAmount,
    paymentUrl: (process.env.ESEWA_PAYMENT_URL || ESEWA_SANDBOX_URL).trim(),
    method: "POST",
    payload: {
      amount: quote.totalAmount.toFixed(2),
      tax_amount: "0",
      total_amount: quote.totalAmount.toFixed(2),
      transaction_uuid: paymentRef,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signatureMeta.signedFieldNames,
      signature: signatureMeta.signature
    }
  };
}

export async function verifyEsewaPayment(userId, { data, checkout, paymentRef }) {
  const secret = (process.env.ESEWA_SECRET_KEY || "").trim();

  if (!secret) {
    const err = new Error("eSewa secret key is not configured");
    err.statusCode = 500;
    throw err;
  }

  let decoded = {};
  try {
    let normalized = String(data || "").replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
    const remainder = normalized.length % 4;
    if (remainder > 0) {
      normalized = normalized.padEnd(normalized.length + (4 - remainder), "=");
    }

    decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
  } catch (_error) {
    decoded = {};
  }

  const providerRef = paymentRef || decoded.transaction_uuid || decoded.transaction_code;
  if (!providerRef) {
    const err = new Error("Invalid eSewa verification payload");
    err.statusCode = 400;
    throw err;
  }

  const ownership = await ensureProviderOwnership({
    userId,
    paymentRef: providerRef,
    provider: "ESEWA"
  });

  if (ownership.error) {
    const err = new Error(ownership.error.message);
    err.statusCode = ownership.error.code;
    throw err;
  }

  if (ownership.alreadyProcessed) {
    return ownership.alreadyProcessed;
  }

  const callbackStatus = String(decoded.status || "").toUpperCase();
  if (callbackStatus === "COMPLETE" && verifyEsewaResponseSignature(decoded, secret)) {
    const paymentNote = `Payment: ESEWA ref ${providerRef}`;
    const order = await createOrder(userId, {
      ...checkout,
      paymentMethod: "BANK_TRANSFER",
      notes: mergeNotes(checkout.notes, paymentNote)
    }, { paymentVerified: true });

    return {
      order,
      alreadyProcessed: false,
      provider: "ESEWA",
      transactionCode: decoded.transaction_code || null,
      paymentRef: providerRef
    };
  }

  const productCode = resolveEsewaProductCode();
  const totalAmount = toMoney(decoded.total_amount || 0) || (await getCartQuote(userId)).totalAmount;
  const statusUrl = (process.env.ESEWA_STATUS_URL || ESEWA_STATUS_SANDBOX_URL).trim();
  const lookupUrl = `${statusUrl}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount.toFixed(2))}&transaction_uuid=${encodeURIComponent(providerRef)}`;

  const lookup = await fetchJson(lookupUrl, { method: "GET" });
  const lookupStatus = String(lookup.data?.status || "").toUpperCase();

  if (!lookup.ok || lookupStatus !== "COMPLETE") {
    const err = new Error("eSewa payment verification failed");
    err.statusCode = 400;
    err.details = lookup.data;
    throw err;
  }

  const paymentNote = `Payment: ESEWA ref ${providerRef}`;
  const order = await createOrder(userId, {
    ...checkout,
    paymentMethod: "BANK_TRANSFER",
    notes: mergeNotes(checkout.notes, paymentNote)
  }, { paymentVerified: true });

  return {
    order,
    alreadyProcessed: false,
    provider: "ESEWA",
    transactionCode: decoded.transaction_code || null,
    paymentRef: providerRef
  };
}

export async function initiateKhaltiPayment(userId, checkout) {
  const quote = await getCartQuote(userId);
  const secret = (process.env.KHALTI_SECRET_KEY || "").trim();

  if (!secret) {
    const err = new Error("Khalti secret key is not configured");
    err.statusCode = 500;
    throw err;
  }

  const paymentRef = createPaymentRef("khalti");
  const successBaseUrl = (process.env.KHALTI_SUCCESS_URL || `${frontendBaseUrl()}/payment/khalti/success`).trim();
  const failureBaseUrl = (process.env.KHALTI_FAILURE_URL || `${frontendBaseUrl()}/payment/failure`).trim();
  const successUrl = appendQueryParams(successBaseUrl, { ref: paymentRef, provider: "khalti" });
  const failureUrl = appendQueryParams(failureBaseUrl, { ref: paymentRef, provider: "khalti" });

  const payload = {
    return_url: successUrl,
    website_url: frontendBaseUrl(),
    amount: quote.totalPaisa,
    purchase_order_id: paymentRef,
    purchase_order_name: `WatchMatrix Order ${paymentRef.slice(-8)}`,
    customer_info: {
      name: checkout.fullName,
      email: checkout.email,
      phone: checkout.phone
    }
  };

  const endpoint = (process.env.KHALTI_INITIATE_URL || KHALTI_INITIATE_SANDBOX_URL).trim();
  const response = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = new Error("Khalti provider request failed");
    err.statusCode = 400;
    err.details = response.data;
    throw err;
  }

  return {
    provider: "KHALTI",
    paymentRef,
    amount: quote.totalAmount,
    pidx: response.data?.pidx,
    paymentUrl: response.data?.payment_url,
    payloadSent: payload,
    failureUrl
  };
}

export async function verifyKhaltiPayment(userId, { pidx, checkout, paymentRef }) {
  const secret = (process.env.KHALTI_SECRET_KEY || "").trim();

  if (!secret) {
    const err = new Error("Khalti secret key is not configured");
    err.statusCode = 500;
    throw err;
  }

  const providerRef = paymentRef || pidx;
  const ownership = await ensureProviderOwnership({
    userId,
    paymentRef: providerRef,
    provider: "KHALTI"
  });

  if (ownership.error) {
    const err = new Error(ownership.error.message);
    err.statusCode = ownership.error.code;
    throw err;
  }

  if (ownership.alreadyProcessed) {
    return ownership.alreadyProcessed;
  }

  const endpoint = (process.env.KHALTI_LOOKUP_URL || KHALTI_LOOKUP_SANDBOX_URL).trim();
  const response = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pidx })
  });

  if (!response.ok) {
    const err = new Error("Khalti verification failed");
    err.statusCode = 400;
    err.details = response.data;
    throw err;
  }

  const providerStatus = String(response.data?.status || "").toUpperCase();
  if (providerStatus !== "COMPLETED") {
    const err = new Error("Khalti payment is not completed");
    err.statusCode = 400;
    err.details = response.data;
    throw err;
  }

  const paymentNote = `Payment: KHALTI ref ${providerRef} pidx ${pidx}`;
  const order = await createOrder(userId, {
    ...checkout,
    paymentMethod: "CARD",
    notes: mergeNotes(checkout.notes, paymentNote)
  }, { paymentVerified: true });

  return {
    order,
    alreadyProcessed: false,
    provider: "KHALTI",
    pidx,
    paymentRef: providerRef
  };
}

function mapOrderToPaymentHistory(order) {
  const provider = order.paymentMethod === "CARD"
    ? "KHALTI"
    : order.paymentMethod === "BANK_TRANSFER"
      ? "ESEWA"
      : "COD";

  const paymentStatus = provider === "COD"
    ? "PENDING_ON_DELIVERY"
    : order.status === "CANCELLED"
      ? "REFUNDED_OR_CANCELLED"
      : "PAID";

  return {
    id: order.id,
    orderId: order.id,
    provider,
    paymentMethod: order.paymentMethod,
    paymentStatus,
    amount: toMoney(order.totalAmount),
    customerName: order.fullName,
    customerEmail: order.email,
    orderStatus: order.status,
    createdAt: order.createdAt,
    notes: order.notes || null
  };
}

export async function listPaymentHistoryByUser(userId, query) {
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    items: orders.map(mapOrderToPaymentHistory),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function listPaymentHistoryForAdmin(query) {
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    items: orders.map(mapOrderToPaymentHistory),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}
