import { rateLimit } from "express-rate-limit";

const jsonRateLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
  errors: [],
};

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonRateLimitResponse,
});

export const analysisRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonRateLimitResponse,
});
