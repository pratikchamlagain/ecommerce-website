import prisma from "../../config/prisma.js";

export async function listNotificationsByUser(userId) {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return items.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    isRead: item.isRead,
    metadata: item.metadata,
    createdAt: item.createdAt
  }));
}

export async function markNotificationRead(userId, notificationId) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true }
  });

  if (!existing) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  return {
    id: updated.id,
    isRead: updated.isRead
  };
}
