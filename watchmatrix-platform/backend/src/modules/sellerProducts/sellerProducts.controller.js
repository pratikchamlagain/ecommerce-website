import {
  createSellerProductSchema,
  sellerProductParamsSchema,
  updateSellerProductSchema
} from "./sellerProducts.schema.js";
import {
  createSellerProduct,
  deleteSellerProduct,
  listCategories,
  listSellerProducts,
  updateSellerProduct
} from "./sellerProducts.service.js";

export async function listMine(req, res, next) {
  try {
    const items = await listSellerProducts(req.user.sub);

    return res.status(200).json({
      ok: true,
      data: items
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAllCategories(_req, res, next) {
  try {
    const items = await listCategories();

    return res.status(200).json({
      ok: true,
      data: items
    });
  } catch (error) {
    return next(error);
  }
}

export async function create(req, res, next) {
  try {
    const payload = createSellerProductSchema.parse(req.body);
    const item = await createSellerProduct(req.user.sub, payload);

    return res.status(201).json({
      ok: true,
      message: "Product created",
      data: item
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

export async function update(req, res, next) {
  try {
    const { productId } = sellerProductParamsSchema.parse(req.params);
    const payload = updateSellerProductSchema.parse(req.body);
    const item = await updateSellerProduct(req.user.sub, productId, payload);

    return res.status(200).json({
      ok: true,
      message: "Product updated",
      data: item
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

export async function remove(req, res, next) {
  try {
    const { productId } = sellerProductParamsSchema.parse(req.params);
    await deleteSellerProduct(req.user.sub, productId);

    return res.status(200).json({
      ok: true,
      message: "Product deleted"
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
