import { z } from "zod";

export const createOrderSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(7, "Phone number is required"),
  addressLine1: z.string().trim().min(5, "Address line 1 is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "CARD", "BANK_TRANSFER"])
});

export const orderParamsSchema = z.object({
  orderId: z.string().min(1)
});

export const sellerOrderItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.string().trim().optional()
});

export const sellerOrderItemParamsSchema = z.object({
  itemId: z.string().min(1)
});

export const sellerOrderItemStatusSchema = z.object({
  sellerStatus: z.enum(["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"])
});

export const sellerFulfillmentLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
