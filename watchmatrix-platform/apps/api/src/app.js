import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

export default app;
