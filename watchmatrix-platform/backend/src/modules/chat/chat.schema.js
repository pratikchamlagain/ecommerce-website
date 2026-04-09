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

export const contactOrdersParamsSchema = z.object({
  contactId: z.string().min(1)
});

export const listEscalationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
