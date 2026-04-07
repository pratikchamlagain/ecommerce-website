import { Router } from "express";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";
import { auditLogs, overview, sellers, updateSellerStatus } from "./admin.controller.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireRoles("ADMIN"));

adminRouter.get("/overview", overview);
adminRouter.get("/sellers", sellers);
adminRouter.get("/audit-logs", auditLogs);
adminRouter.patch("/sellers/:sellerId/status", updateSellerStatus);

export default adminRouter;
