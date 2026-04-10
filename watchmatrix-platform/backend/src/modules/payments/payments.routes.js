import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  adminPaymentHistory,
  customerPaymentHistory,
  initiateEsewa,
  initiateKhalti,
  verifyEsewa,
  verifyKhalti
} from "./payments.controller.js";

const paymentsRouter = Router();

paymentsRouter.use(requireAuth);
paymentsRouter.post("/esewa/initiate", initiateEsewa);
paymentsRouter.post("/esewa/verify", verifyEsewa);
paymentsRouter.post("/khalti/initiate", initiateKhalti);
paymentsRouter.post("/khalti/verify", verifyKhalti);
paymentsRouter.get("/history", customerPaymentHistory);
paymentsRouter.get("/admin/history", adminPaymentHistory);

export default paymentsRouter;
