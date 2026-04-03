import { listProductsQuerySchema, productSlugParamsSchema } from "./products.schema.js";
import { getProductBySlug, listProducts } from "./products.service.js";

export async function list(req, res, next) {
  try {
    const query = listProductsQuerySchema.parse(req.query);
    const data = await listProducts(query);

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

export async function detail(req, res, next) {
  try {
    const { slug } = productSlugParamsSchema.parse(req.params);
    const data = await getProductBySlug(slug);

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
