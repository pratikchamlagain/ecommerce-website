import { createOrderSchema, orderParamsSchema } from "./orders.schema.js";
import { createOrder, getOrderByIdForUser, listOrdersByUser } from "./orders.service.js";

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
