import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { listMyNotifications, readNotification } from "./notifications.controller.js";

const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", listMyNotifications);
notificationsRouter.patch("/:notificationId/read", readNotification);

export default notificationsRouter;
