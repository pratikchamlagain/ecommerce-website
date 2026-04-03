import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  addItem,
  clearCurrentCart,
  getCurrentCart,
  removeItem,
  updateItem
} from "./cart.controller.js";

const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", getCurrentCart);
cartRouter.post("/items", addItem);
cartRouter.patch("/items/:itemId", updateItem);
cartRouter.delete("/items/:itemId", removeItem);
cartRouter.delete("/clear", clearCurrentCart);

export default cartRouter;
