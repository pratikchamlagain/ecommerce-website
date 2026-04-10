import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  adminPaymentHistory,
  initiateEsewaPayment,
  initiateKhaltiPayment,
  myPaymentHistory,
  verifyEsewaPayment,
  verifyKhaltiPayment
} from "./payments.controller.js";

const paymentsRouter = Router();

paymentsRouter.use(requireAuth);
paymentsRouter.post("/esewa/initiate", initiateEsewaPayment);
paymentsRouter.post("/esewa/verify", verifyEsewaPayment);
paymentsRouter.post("/khalti/initiate", initiateKhaltiPayment);
paymentsRouter.post("/khalti/verify", verifyKhaltiPayment);
paymentsRouter.get("/history", myPaymentHistory);
paymentsRouter.get("/admin/history", adminPaymentHistory);

export default paymentsRouter;
