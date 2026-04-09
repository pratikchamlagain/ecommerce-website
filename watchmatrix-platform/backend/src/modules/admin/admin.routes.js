import { Router } from "express";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";
import { auditLogs, orders, overview, sellers, updateOrderStatus, updateSellerStatus } from "./admin.controller.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireRoles("ADMIN"));

adminRouter.get("/overview", overview);
adminRouter.get("/sellers", sellers);
adminRouter.get("/audit-logs", auditLogs);
adminRouter.get("/orders", orders);
adminRouter.patch("/sellers/:sellerId/status", updateSellerStatus);
adminRouter.patch("/orders/:orderId/status", updateOrderStatus);

export default adminRouter;
