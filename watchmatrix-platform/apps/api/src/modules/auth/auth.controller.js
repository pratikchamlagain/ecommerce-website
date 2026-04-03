import { loginSchema, registerSchema } from "./auth.schema.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);

    return res.status(201).json({
      ok: true,
      message: "Account created",
      data: result
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

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);

    return res.status(200).json({
      ok: true,
      message: "Login successful",
      data: result
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

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.sub);

    return res.status(200).json({
      ok: true,
      data: user
    });
  } catch (error) {
    return next(error);
  }
}
