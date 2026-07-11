import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import ApiError from "./utils/apiError.js";

const app: Application = express();
const allowedOrigins = (
  process.env.CORS_ORIGIN ?? "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(requestLogger);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import AnalysisRouter from "./routes/analysis.route.js";
import AuthRouter from "./routes/auth.route.js";

app.get("/api/health", (_: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    },
    msg: "JobGuard API is healthy",
  });
});

app.use("/api/analysis", AnalysisRouter);
app.use("/api/auth", AuthRouter);

app.use(
  (err: Error, _: Request, res: Response, _next: NextFunction): void => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;

    res.status(statusCode).json({
      success: false,
      message:
        err instanceof ApiError ? err.message : "Internal server error",
      errors: err instanceof ApiError ? err.errors : [],
    });
  },
);

export { app };
