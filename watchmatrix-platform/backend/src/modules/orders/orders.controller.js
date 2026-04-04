import { createOrderSchema } from "./orders.schema.js";
import { createOrder } from "./orders.service.js";

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
