import { z } from "zod";

export const sellerStatusParamsSchema = z.object({
  sellerId: z.string().min(1)
});

export const sellerStatusBodySchema = z.object({
  isActive: z.boolean()
});

export const listSellersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "active", "suspended"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const listOrdersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const orderStatusParamsSchema = z.object({
  orderId: z.string().min(1)
});

export const orderStatusBodySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"])
});
