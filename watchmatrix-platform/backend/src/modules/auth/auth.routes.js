import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { login, me, register } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

export default authRouter;
