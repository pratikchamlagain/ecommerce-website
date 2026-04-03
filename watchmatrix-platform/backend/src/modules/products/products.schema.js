import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
}).refine((data) => {
  if (data.minPrice == null || data.maxPrice == null) {
    return true;
  }
  return data.maxPrice >= data.minPrice;
}, {
  message: "maxPrice must be greater than or equal to minPrice",
  path: ["maxPrice"]
});

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1)
});
