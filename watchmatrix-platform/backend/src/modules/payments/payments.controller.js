import {
  initiateEsewaSchema,
  initiateKhaltiSchema,
  paymentHistoryQuerySchema,
  verifyEsewaSchema,
  verifyKhaltiSchema
} from "./payments.schema.js";
import {
  initiateEsewaPayment,
  initiateKhaltiPayment,
  listPaymentHistoryByUser,
  listPaymentHistoryForAdmin,
  verifyEsewaPayment,
  verifyKhaltiPayment
} from "./payments.service.js";

function zodErrorResponse(res, error) {
  return res.status(400).json({
    ok: false,
    message: "Validation failed",
    errors: error.issues
  });
}

export async function initiateEsewa(req, res, next) {
  try {
    const payload = initiateEsewaSchema.parse(req.body);
    const data = await initiateEsewaPayment(req.user.sub, payload.checkout);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
    }

    return next(error);
  }
}

export async function verifyEsewa(req, res, next) {
  try {
    const payload = verifyEsewaSchema.parse(req.body);
    const data = await verifyEsewaPayment(req.user.sub, payload);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
    }

    return next(error);
  }
}

export async function initiateKhalti(req, res, next) {
  try {
    const payload = initiateKhaltiSchema.parse(req.body);
    const data = await initiateKhaltiPayment(req.user.sub, payload.checkout);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
    }

    return next(error);
  }
}

export async function verifyKhalti(req, res, next) {
  try {
    const payload = verifyKhaltiSchema.parse(req.body);
    const data = await verifyKhaltiPayment(req.user.sub, payload);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
    }

    return next(error);
  }
}

export async function customerPaymentHistory(req, res, next) {
  try {
    const query = paymentHistoryQuerySchema.parse(req.query);
    const data = await listPaymentHistoryByUser(req.user.sub, query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
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
    const data = await listPaymentHistoryForAdmin(query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return zodErrorResponse(res, error);
    }

    return next(error);
  }
}
