import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import prisma from "../config/prisma.js";

let ioInstance = null;

async function resolveSocketUser(socket) {
  const authToken = socket.handshake?.auth?.token;
  const headerToken = socket.handshake?.headers?.authorization?.startsWith("Bearer ")
    ? socket.handshake.headers.authorization.slice(7)
    : null;
  const token = authToken || headerToken;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }

  return user;
}

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const user = await resolveSocketUser(socket);
      socket.data.user = user;
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);

    socket.on("chat:join", async (conversationId) => {
      if (!conversationId) {
        return;
      }

      const member = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId
        },
        select: {
          id: true
        }
      });

      if (!member) {
        socket.emit("chat:error", "Forbidden conversation");
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit("chat:joined", conversationId);
    });

    socket.on("chat:leave", (conversationId) => {
      if (!conversationId) {
        return;
      }
      socket.leave(`conversation:${conversationId}`);
    });
  });

  ioInstance = io;
  return io;
}

export function emitConversationMessage(conversationId, payload) {
  if (!ioInstance) {
    return;
  }

  ioInstance.to(`conversation:${conversationId}`).emit("chat:message", payload);
}

export function emitUsersEvent(userIds, eventName, payload) {
  if (!ioInstance) {
    return;
  }

  for (const userId of userIds) {
    ioInstance.to(`user:${userId}`).emit(eventName, payload);
  }
}
