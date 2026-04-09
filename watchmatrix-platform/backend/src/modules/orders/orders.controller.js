import {
  createOrderSchema,
  orderParamsSchema,
  sellerFulfillmentLogsQuerySchema,
  sellerOrderItemParamsSchema,
  sellerOrderItemsQuerySchema,
  sellerOrderItemStatusSchema
} from "./orders.schema.js";
import {
  createOrder,
  getOrderByIdForUser,
  listSellerFulfillmentLogs,
  listOrderItemsBySeller,
  listOrdersByUser,
  updateSellerOrderItemStatus
} from "./orders.service.js";

export async function placeOrder(req, res, next) {
  try {
    const payload = createOrderSchema.parse(req.body);
    const data = await createOrder(req.user.sub, payload);

    return res.status(201).json({
      ok: true,
      message: "Order placed successfully",
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

export async function listMyOrders(req, res, next) {
  try {
    const data = await listOrdersByUser(req.user.sub);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyOrderById(req, res, next) {
  try {
    const { orderId } = orderParamsSchema.parse(req.params);
    const data = await getOrderByIdForUser(req.user.sub, orderId);

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

export async function listSellerOrderItems(req, res, next) {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const query = sellerOrderItemsQuerySchema.parse(req.query);
    const data = await listOrderItemsBySeller(req.user.sub, query);

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

export async function patchSellerOrderItemStatus(req, res, next) {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { itemId } = sellerOrderItemParamsSchema.parse(req.params);
    const payload = sellerOrderItemStatusSchema.parse(req.body);

    const data = await updateSellerOrderItemStatus(req.user.sub, itemId, payload);

    return res.status(200).json({
      ok: true,
      message: "Seller item status updated",
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

export async function listSellerFulfillmentHistory(req, res, next) {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const query = sellerFulfillmentLogsQuerySchema.parse(req.query);
    const data = await listSellerFulfillmentLogs(req.user.sub, query);

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
