import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
	getMyOrderById,
	listMyOrders,
	listSellerOrderItems,
	patchSellerOrderItemStatus,
	placeOrder
} from "./orders.controller.js";

const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.get("/seller/items", listSellerOrderItems);
ordersRouter.patch("/seller/items/:itemId/status", patchSellerOrderItemStatus);
ordersRouter.post("/", placeOrder);
ordersRouter.get("/", listMyOrders);
ordersRouter.get("/:orderId", getMyOrderById);

export default ordersRouter;
