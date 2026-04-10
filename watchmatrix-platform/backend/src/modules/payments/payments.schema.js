import { z } from "zod";

export const checkoutPayloadSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(7, "Phone number is required"),
  addressLine1: z.string().trim().min(5, "Address line 1 is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "KHALTI", "ESEWA"])
});

export const initiateKhaltiSchema = z.object({
  checkout: checkoutPayloadSchema
});

export const verifyKhaltiSchema = z.object({
  pidx: z.string().trim().min(1),
  checkout: checkoutPayloadSchema
});

export const initiateEsewaSchema = z.object({
  checkout: checkoutPayloadSchema
});

export const verifyEsewaSchema = z.object({
  data: z.string().trim().min(1),
  checkout: checkoutPayloadSchema
});

export const paymentHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});
