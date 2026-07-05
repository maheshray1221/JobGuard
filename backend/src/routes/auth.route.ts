import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controller/user.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";
import { loginSchema } from "../schemas/loginSchema.js";
import { registerSchema } from "../schemas/registerSchema.js";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  validateBody(registerSchema),
  registerUser,
);
router.post("/login", authRateLimit, validateBody(loginSchema), loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
