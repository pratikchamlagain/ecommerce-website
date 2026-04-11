import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { authRateLimit } from "../../middlewares/rateLimit.js";
import { login, me, register, registerAdmin } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authRateLimit, register);
authRouter.post("/register-admin", authRateLimit, registerAdmin);
authRouter.post("/login", authRateLimit, login);
authRouter.get("/me", requireAuth, me);

export default authRouter;
