import { z } from "zod";

export const createConversationSchema = z.object({
  participantId: z.string().min(1),
  orderId: z.string().min(1).optional()
});

export const conversationParamsSchema = z.object({
  conversationId: z.string().min(1)
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  before: z.string().datetime().optional()
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(1500)
});
