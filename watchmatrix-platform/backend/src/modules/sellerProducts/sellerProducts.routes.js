import { Router } from "express";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";
import {
  create,
  listAllCategories,
  listMine,
  remove,
  update
} from "./sellerProducts.controller.js";

const sellerProductsRouter = Router();

sellerProductsRouter.use(requireAuth, requireRoles("SELLER"));

sellerProductsRouter.get("/categories", listAllCategories);
sellerProductsRouter.get("/products", listMine);
sellerProductsRouter.post("/products", create);
sellerProductsRouter.patch("/products/:productId", update);
sellerProductsRouter.delete("/products/:productId", remove);

export default sellerProductsRouter;
