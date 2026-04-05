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
