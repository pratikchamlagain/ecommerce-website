import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./modules/auth/auth.routes.js";
import productsRouter from "./modules/products/products.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "watchmatrix-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
