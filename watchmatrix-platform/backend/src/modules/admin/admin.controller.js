import {
  listAuditLogsQuerySchema,
  listSellersQuerySchema,
  sellerStatusBodySchema,
  sellerStatusParamsSchema
} from "./admin.schema.js";
import { getAdminOverview, listAdminAuditLogs, listSellersForAdmin, setSellerActiveStatus } from "./admin.service.js";

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
