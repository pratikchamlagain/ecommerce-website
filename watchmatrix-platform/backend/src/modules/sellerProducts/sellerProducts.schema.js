import { z } from "zod";

export const createSellerProductSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  brand: z.string().trim().min(2, "Brand is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().url("Image URL must be valid"),
  categorySlug: z.string().trim().min(1, "Category is required")
});

export const updateSellerProductSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().min(10).optional(),
    brand: z.string().trim().min(2).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    imageUrl: z.string().trim().url().optional(),
    categorySlug: z.string().trim().min(1).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required"
  });

export const sellerProductParamsSchema = z.object({
  productId: z.string().min(1)
});
