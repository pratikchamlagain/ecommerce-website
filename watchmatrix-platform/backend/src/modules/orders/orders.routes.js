import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
	getMyOrderById,
	listSellerFulfillmentHistory,
	listMyOrders,
	listSellerOrderItems,
	patchSellerOrderItemStatus,
	placeOrder
} from "./orders.controller.js";

const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.get("/seller/items", listSellerOrderItems);
ordersRouter.get("/seller/fulfillment-logs", listSellerFulfillmentHistory);
ordersRouter.patch("/seller/items/:itemId/status", patchSellerOrderItemStatus);
ordersRouter.post("/", placeOrder);
ordersRouter.get("/", listMyOrders);
ordersRouter.get("/:orderId", getMyOrderById);

export default ordersRouter;
