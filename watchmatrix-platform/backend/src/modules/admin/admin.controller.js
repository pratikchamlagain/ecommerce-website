import {
  listAuditLogsQuerySchema,
  listOrdersQuerySchema,
  listSellersQuerySchema,
  orderDetailParamsSchema,
  orderStatusBodySchema,
  orderStatusParamsSchema,
  sellerStatusBodySchema,
  sellerStatusParamsSchema
} from "./admin.schema.js";
import {
  getAdminOverview,
  getOrderDetailForAdmin,
  listAdminAuditLogs,
  listOrdersForAdmin,
  listSellersForAdmin,
  setOrderStatusByAdmin,
  setSellerActiveStatus
} from "./admin.service.js";

export async function overview(_req, res, next) {
  try {
    const data = await getAdminOverview();

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

export async function sellers(req, res, next) {
  try {
    const query = listSellersQuerySchema.parse(req.query);
    const data = await listSellersForAdmin(query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function updateSellerStatus(req, res, next) {
  try {
    const { sellerId } = sellerStatusParamsSchema.parse(req.params);
    const { isActive } = sellerStatusBodySchema.parse(req.body);

    const data = await setSellerActiveStatus(req.user.sub, sellerId, isActive);

    return res.status(200).json({
      ok: true,
      message: isActive ? "Seller activated" : "Seller suspended",
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function auditLogs(req, res, next) {
  try {
    const query = listAuditLogsQuerySchema.parse(req.query);
    const data = await listAdminAuditLogs(query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function orders(req, res, next) {
  try {
    const query = listOrdersQuerySchema.parse(req.query);
    const data = await listOrdersForAdmin(query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { orderId } = orderStatusParamsSchema.parse(req.params);
    const { status } = orderStatusBodySchema.parse(req.body);

    const data = await setOrderStatusByAdmin(req.user.sub, orderId, status);

    return res.status(200).json({
      ok: true,
      message: "Order status updated",
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function orderDetail(req, res, next) {
  try {
    const { orderId } = orderDetailParamsSchema.parse(req.params);
    const data = await getOrderDetailForAdmin(orderId);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}
