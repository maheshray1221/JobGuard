import { Router } from "express";

import { validateBody } from "../middleware/validate.middleware.js";  // zod validation
import { analysisSchema } from "../schemas/analysisSchema.js";
import {
  analyzeJob,
  getHistory,
  getSingleAnalysis,
} from "../controller/analysis.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { analysisRateLimit } from "../middleware/rateLimit.middleware.js";
  //zod validation schema


const router = Router();

router.post(
  "/analyze",
  analysisRateLimit,
  verifyJWT,
  validateBody(analysisSchema),
  analyzeJob,
);
router.get("/history", verifyJWT, getHistory);
router.get("/history/:id", verifyJWT, getSingleAnalysis);


export default router;
