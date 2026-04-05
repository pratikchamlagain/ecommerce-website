import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { getMyOrderById, listMyOrders, placeOrder } from "./orders.controller.js";

const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.post("/", placeOrder);
ordersRouter.get("/", listMyOrders);
ordersRouter.get("/:orderId", getMyOrderById);

export default ordersRouter;
