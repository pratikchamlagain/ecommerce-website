import { z } from "zod";

export const sellerStatusParamsSchema = z.object({
  sellerId: z.string().min(1)
});

export const sellerStatusBodySchema = z.object({
  isActive: z.boolean()
});
