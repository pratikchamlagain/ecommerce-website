import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { placeOrder } from "./orders.controller.js";

const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.post("/", placeOrder);

export default ordersRouter;
