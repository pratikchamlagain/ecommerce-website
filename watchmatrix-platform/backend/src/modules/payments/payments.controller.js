import {
  initiateEsewaSchema,
  initiateKhaltiSchema,
  paymentHistoryQuerySchema,
  verifyEsewaSchema,
  verifyKhaltiSchema
} from "./payments.schema.js";
import {
  initiateEsewa,
  initiateKhalti,
  listPaymentsForAdmin,
  listPaymentsForUser,
  verifyEsewaAndCreateOrder,
  verifyKhaltiAndCreateOrder
} from "./payments.service.js";

export async function initiateEsewaPayment(req, res, next) {
  try {
    const payload = initiateEsewaSchema.parse(req.body);
    const data = await initiateEsewa(req.user.sub, payload);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}

export async function verifyEsewaPayment(req, res, next) {
  try {
    const payload = verifyEsewaSchema.parse(req.body);
    const data = await verifyEsewaAndCreateOrder(req.user.sub, payload);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}

export async function initiateKhaltiPayment(req, res, next) {
  try {
    const payload = initiateKhaltiSchema.parse(req.body);
    const data = await initiateKhalti(req.user.sub, payload);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}

export async function verifyKhaltiPayment(req, res, next) {
  try {
    const payload = verifyKhaltiSchema.parse(req.body);
    const data = await verifyKhaltiAndCreateOrder(req.user.sub, payload);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}

export async function myPaymentHistory(req, res, next) {
  try {
    const query = paymentHistoryQuerySchema.parse(req.query);
    const data = await listPaymentsForUser(req.user.sub, query);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}

export async function adminPaymentHistory(req, res, next) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const query = paymentHistoryQuerySchema.parse(req.query);
    const data = await listPaymentsForAdmin(query);

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Validation failed", errors: error.issues });
    }

    return next(error);
  }
}
