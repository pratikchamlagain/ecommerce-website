import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  contacts,
  contactOrders,
  escalateConversation,
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
chatRouter.get("/conversations", conversations);
chatRouter.post("/conversations", createConversation);
chatRouter.get("/conversations/:conversationId/messages", messages);
chatRouter.post("/conversations/:conversationId/messages", sendMessage);
chatRouter.patch("/conversations/:conversationId/read", readConversation);
chatRouter.post("/conversations/:conversationId/escalate", escalateConversation);

export default chatRouter;
