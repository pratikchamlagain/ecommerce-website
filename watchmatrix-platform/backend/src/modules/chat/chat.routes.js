import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { chatMessageThrottle } from "../../middlewares/chatThrottle.js";
import { chatCreateRateLimit } from "../../middlewares/rateLimit.js";
import {
  contacts,
  contactOrders,
  escalateConversation,
  escalations,
  conversations,
  createConversation,
  messages,
  readConversation,
  sendMessage
} from "./chat.controller.js";

const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.get("/contacts", contacts);
chatRouter.get("/contacts/:contactId/orders", contactOrders);
chatRouter.get("/escalations", escalations);
chatRouter.get("/conversations", conversations);
chatRouter.post("/conversations", chatCreateRateLimit, createConversation);
chatRouter.get("/conversations/:conversationId/messages", messages);
chatRouter.post("/conversations/:conversationId/messages", chatMessageThrottle, sendMessage);
chatRouter.patch("/conversations/:conversationId/read", readConversation);
chatRouter.post("/conversations/:conversationId/escalate", chatCreateRateLimit, escalateConversation);

export default chatRouter;
