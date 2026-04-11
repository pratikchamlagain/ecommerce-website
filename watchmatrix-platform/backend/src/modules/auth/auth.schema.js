import { z } from "zod";

const sellerProfileSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required"),
  businessType: z.string().trim().min(2, "Business type is required"),
  businessAddress: z.string().trim().min(5, "Business address is required"),
  panOrVat: z.string().trim().min(5, "PAN/VAT is required"),
  phone: z.string().trim().min(7, "Business phone is required"),
  yearsInBusiness: z.coerce.number().int().min(0).max(80).optional(),
  monthlyOrderVolume: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url("Website URL must be valid").optional().or(z.literal(""))
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "SELLER"]).optional().default("CUSTOMER"),
  sellerProfile: sellerProfileSchema.optional()
}).superRefine((value, context) => {
  if (value.role === "SELLER" && !value.sellerProfile) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sellerProfile"],
      message: "Seller business profile is required"
    });
  }
});

export const bootstrapAdminSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  setupKey: z.string().trim().min(8, "Setup key is required")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});
