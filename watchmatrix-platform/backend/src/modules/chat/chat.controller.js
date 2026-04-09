import {
  conversationParamsSchema,
  createConversationSchema,
  listMessagesQuerySchema,
  sendMessageSchema
} from "./chat.schema.js";
import {
  createOrGetConversation,
  listAllowedChatContacts,
  listConversationsByUser,
  listMessagesByConversation,
  markConversationRead,
  sendMessageToConversation
} from "./chat.service.js";

export async function contacts(req, res, next) {
  try {
    const data = await listAllowedChatContacts(req.user.sub);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

export async function conversations(req, res, next) {
  try {
    const data = await listConversationsByUser(req.user.sub);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

export async function createConversation(req, res, next) {
  try {
    const payload = createConversationSchema.parse(req.body);
    const data = await createOrGetConversation(req.user.sub, payload);

    return res.status(201).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function messages(req, res, next) {
  try {
    const { conversationId } = conversationParamsSchema.parse(req.params);
    const query = listMessagesQuerySchema.parse(req.query);

    const data = await listMessagesByConversation(req.user.sub, conversationId, query);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { conversationId } = conversationParamsSchema.parse(req.params);
    const { content } = sendMessageSchema.parse(req.body);

    const data = await sendMessageToConversation(req.user.sub, conversationId, content);

    return res.status(201).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}

export async function readConversation(req, res, next) {
  try {
    const { conversationId } = conversationParamsSchema.parse(req.params);
    const data = await markConversationRead(req.user.sub, conversationId);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        errors: error.issues
      });
    }

    return next(error);
  }
}
