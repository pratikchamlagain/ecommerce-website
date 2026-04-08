import { z } from "zod";
import { listNotificationsByUser, markNotificationRead } from "./notifications.service.js";

const paramsSchema = z.object({
  notificationId: z.string().min(1)
});

export async function listMyNotifications(req, res, next) {
  try {
    const data = await listNotificationsByUser(req.user.sub);

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

export async function readNotification(req, res, next) {
  try {
    const { notificationId } = paramsSchema.parse(req.params);
    const data = await markNotificationRead(req.user.sub, notificationId);

    return res.status(200).json({
      ok: true,
      message: "Notification marked as read",
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
