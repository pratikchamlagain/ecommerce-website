import { Router } from "express";
import { detail, list } from "./products.controller.js";

const productsRouter = Router();

productsRouter.get("/", list);
productsRouter.get("/:slug", detail);

export default productsRouter;
