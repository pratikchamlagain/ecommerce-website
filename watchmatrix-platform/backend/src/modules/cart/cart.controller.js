import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema
} from "./cart.schema.js";
import {
  addItemToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from "./cart.service.js";

function validationError(res, error) {
  return res.status(400).json({
    ok: false,
    message: "Validation failed",
    errors: error.issues
  });
}

export async function getCurrentCart(req, res, next) {
  try {
    const data = await getCart(req.user.sub);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function addItem(req, res, next) {
  try {
    const payload = addCartItemSchema.parse(req.body);
    const data = await addItemToCart(req.user.sub, payload);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return validationError(res, error);
    }
    return next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { itemId } = cartItemParamsSchema.parse(req.params);
    const { quantity } = updateCartItemSchema.parse(req.body);
    const data = await updateCartItem(req.user.sub, itemId, quantity);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return validationError(res, error);
    }
    return next(error);
  }
}

export async function removeItem(req, res, next) {
  try {
    const { itemId } = cartItemParamsSchema.parse(req.params);
    const data = await removeCartItem(req.user.sub, itemId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return validationError(res, error);
    }
    return next(error);
  }
}

export async function clearCurrentCart(req, res, next) {
  try {
    const data = await clearCart(req.user.sub);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}
