import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "node:path";
import authRouter from "./modules/auth/auth.routes.js";
import productsRouter from "./modules/products/products.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import ordersRouter from "./modules/orders/orders.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";
import sellerProductsRouter from "./modules/sellerProducts/sellerProducts.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const allowWildcard = allowedOrigins.includes("*");

function corsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true);
  }

  if (allowWildcard || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error("CORS origin is not allowed"));
}

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

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
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/seller", sellerProductsRouter);
app.use("/api/v1/admin", adminRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
